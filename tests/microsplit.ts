/**
 * MicroSplit — Anchor integration tests
 *
 * Run with:  anchor test
 *
 * The test suite covers the three on-chain instructions:
 *   - create_split
 *   - pay_split
 *   - close_split
 *
 * and validates custom error codes for every guard condition.
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { Microsplit } from "../target/types/microsplit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the PDA for a given (creator, splitId) pair. */
async function splitPda(
  program: Program<Microsplit>,
  creator: PublicKey,
  splitId: string
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("split"), creator.toBuffer(), Buffer.from(splitId)],
    program.programId
  );
}

/** Airdrop SOL and wait for confirmation. */
async function airdrop(
  connection: anchor.web3.Connection,
  wallet: PublicKey,
  sol = 2
) {
  const sig = await connection.requestAirdrop(wallet, sol * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, "confirmed");
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("microsplit", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Microsplit as Program<Microsplit>;
  const connection = provider.connection;

  // Re-usable keypairs across test groups
  let creator: Keypair;
  let participant1: Keypair;
  let participant2: Keypair;

  before(async () => {
    creator = Keypair.generate();
    participant1 = Keypair.generate();
    participant2 = Keypair.generate();

    // Fund wallets from the local validator's faucet
    await Promise.all([
      airdrop(connection, creator.publicKey),
      airdrop(connection, participant1.publicKey),
      airdrop(connection, participant2.publicKey),
    ]);
  });

  // -------------------------------------------------------------------------
  // create_split
  // -------------------------------------------------------------------------

  describe("create_split", () => {
    it("creates a split account with correct on-chain state", async () => {
      const splitId = "test-split-01";
      const totalAmount = new BN(2 * LAMPORTS_PER_SOL); // 2 SOL
      const participants = [participant1.publicKey, participant2.publicKey];

      const [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      await program.methods
        .createSplit(splitId, totalAmount, participants)
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      const account = await program.account.splitState.fetch(splitAddress);

      assert.equal(account.creator.toBase58(), creator.publicKey.toBase58());
      assert.equal(account.splitId, splitId);
      assert.isTrue(account.totalAmount.eq(totalAmount));
      assert.isTrue(
        account.amountPerPerson.eq(totalAmount.divn(participants.length))
      );
      assert.equal(account.participants.length, participants.length);
      assert.deepEqual(account.paid, [false, false]);
    });

    it("rejects a split_id longer than 32 characters", async () => {
      const splitId = "a".repeat(33); // 33 chars — too long
      const [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      try {
        await program.methods
          .createSplit(splitId, new BN(LAMPORTS_PER_SOL), [participant1.publicKey])
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Expected SplitIdTooLong error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "SplitIdTooLong");
      }
    });

    it("rejects an empty participant list", async () => {
      const splitId = "empty-parts";
      const [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      try {
        await program.methods
          .createSplit(splitId, new BN(LAMPORTS_PER_SOL), [])
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Expected NoParticipants error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "NoParticipants");
      }
    });

    it("rejects more than 10 participants", async () => {
      const splitId = "too-many";
      const [splitAddress] = await splitPda(program, creator.publicKey, splitId);
      const tooMany = Array.from({ length: 11 }, () => Keypair.generate().publicKey);

      try {
        await program.methods
          .createSplit(splitId, new BN(LAMPORTS_PER_SOL), tooMany)
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Expected TooManyParticipants error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "TooManyParticipants");
      }
    });

    it("rejects a zero total amount", async () => {
      const splitId = "zero-amount";
      const [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      try {
        await program.methods
          .createSplit(splitId, new BN(0), [participant1.publicKey])
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Expected InvalidAmount error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "InvalidAmount");
      }
    });
  });

  // -------------------------------------------------------------------------
  // pay_split
  // -------------------------------------------------------------------------

  describe("pay_split", () => {
    const splitId = "pay-test-01";
    let splitAddress: PublicKey;

    before(async () => {
      [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      await program.methods
        .createSplit(
          splitId,
          new BN(2 * LAMPORTS_PER_SOL),
          [participant1.publicKey, participant2.publicKey]
        )
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();
    });

    it("transfers lamports and marks participant as paid", async () => {
      const creatorBefore = await connection.getBalance(creator.publicKey);

      await program.methods
        .paySplit(splitId)
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
          payer: participant1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([participant1])
        .rpc();

      const account = await program.account.splitState.fetch(splitAddress);
      assert.isTrue(account.paid[0], "participant1 should be marked paid");
      assert.isFalse(account.paid[1], "participant2 should still be unpaid");

      const creatorAfter = await connection.getBalance(creator.publicKey);
      assert.isAbove(creatorAfter, creatorBefore, "Creator balance should increase");
    });

    it("rejects a double-payment from the same participant", async () => {
      try {
        await program.methods
          .paySplit(splitId)
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            payer: participant1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([participant1])
          .rpc();
        assert.fail("Expected AlreadyPaid error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "AlreadyPaid");
      }
    });

    it("rejects payment from a wallet not in the participant list", async () => {
      const outsider = Keypair.generate();
      await airdrop(connection, outsider.publicKey);

      try {
        await program.methods
          .paySplit(splitId)
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
            payer: outsider.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([outsider])
          .rpc();
        assert.fail("Expected NotAParticipant error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "NotAParticipant");
      }
    });
  });

  // -------------------------------------------------------------------------
  // close_split
  // -------------------------------------------------------------------------

  describe("close_split", () => {
    const splitId = "close-test-01";
    let splitAddress: PublicKey;

    before(async () => {
      [splitAddress] = await splitPda(program, creator.publicKey, splitId);

      // Create the split
      await program.methods
        .createSplit(
          splitId,
          new BN(LAMPORTS_PER_SOL),
          [participant1.publicKey]
        )
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();
    });

    it("rejects closing while there are unpaid participants", async () => {
      try {
        await program.methods
          .closeSplit()
          .accounts({
            split: splitAddress,
            creator: creator.publicKey,
          })
          .signers([creator])
          .rpc();
        assert.fail("Expected NotFullyPaid error");
      } catch (err: unknown) {
        assert.include((err as Error).toString(), "NotFullyPaid");
      }
    });

    it("closes the account after all participants have paid", async () => {
      // Pay the single participant's share
      await program.methods
        .paySplit(splitId)
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
          payer: participant1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([participant1])
        .rpc();

      // Now close the split
      await program.methods
        .closeSplit()
        .accounts({
          split: splitAddress,
          creator: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // The account should no longer exist
      const info = await connection.getAccountInfo(splitAddress);
      assert.isNull(info, "Split account should be closed");
    });
  });
});
