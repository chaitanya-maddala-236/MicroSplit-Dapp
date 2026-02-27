# MicroSplit DApp

A decentralized expense-splitting application built on **Solana**. Split bills with friends using on-chain smart-contract transactions via the Phantom wallet on Solana Devnet.

---

## Project Structure

```
MicroSplit-Dapp/
├── programs/               # Solana smart contracts (Rust + Anchor)
│   └── microsplit/
│       ├── src/
│       │   └── lib.rs      # Main program: create_split, pay_split, close_split
│       └── Cargo.toml      # Crate manifest
├── tests/
│   └── microsplit.ts       # Anchor integration tests (TypeScript / Mocha)
├── src/                    # React frontend
│   ├── components/
│   ├── contexts/
│   └── pages/
├── Anchor.toml             # Anchor workspace & cluster configuration
├── Cargo.toml              # Rust workspace manifest
├── tsconfig.json           # TypeScript config for Anchor tests
└── package.json            # Frontend dependencies
```

---

## Features

- 🔗 **Phantom Wallet Integration** — Connect/disconnect with one click
- ➗ **Create Splits** — Enter a total amount and participant wallet addresses
- 🔗 **Shareable Payment Links** — Generate per-participant payment links
- 💸 **On-chain Payments** — Execute SOL transfers via the MicroSplit smart contract on Solana Devnet
- ✅ **Transaction Confirmation** — View confirmed transaction hash on Solana Explorer
- 🔒 **Smart-contract Guards** — Double-payment protection, participant validation, and rent reclamation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Rust, Anchor Framework 0.29, Solana Program Library |
| Frontend | React 19, Vite, Tailwind CSS v3, Framer Motion |
| Wallet | Phantom via `@solana/wallet-adapter-react` |
| RPC | Solana Devnet (`https://api.devnet.solana.com`) |
| Testing | Anchor test runner, Mocha, Chai, TypeScript |

---

## Backend — Solana Smart Contract

The Anchor program lives in `programs/microsplit/src/lib.rs` and exposes three instructions.

### Program ID

> ⚠️ **Placeholder ID** — The ID below is a placeholder used for local development.
> After running `anchor deploy`, copy the real program ID printed by the CLI and
> update **both** `Anchor.toml` (under `[programs.devnet]`) **and** the constant
> in your frontend integration code.

```
MSPLit11111111111111111111111111111111111111  (placeholder — replace after deploy)
```

### Instructions

#### `create_split`

Initialises a new expense-split **PDA** derived from `["split", creator, split_id]`.

| Argument | Type | Description |
|----------|------|-------------|
| `split_id` | `String` (≤ 32 chars) | Unique slug for this split |
| `total_amount` | `u64` (lamports) | Total bill to be divided |
| `participants` | `Vec<Pubkey>` (1–10) | Ordered list of payer wallets |

**Accounts required**

| Account | Role |
|---------|------|
| `split` | PDA — initialised by this instruction (writable) |
| `creator` | Signer — pays rent for the account (writable) |
| `system_program` | Solana System Program |

#### `pay_split`

Transfers `amount_per_person` lamports from a participant to the creator and marks them as paid.

| Argument | Type | Description |
|----------|------|-------------|
| `split_id` | `String` | Slug used to re-derive the PDA seeds |

**Accounts required**

| Account | Role |
|---------|------|
| `split` | PDA — updated by this instruction (writable) |
| `creator` | Creator wallet — receives payment (writable) |
| `payer` | Participant signer — pays their share (writable) |
| `system_program` | Solana System Program |

#### `close_split`

Closes the split PDA once every participant has paid, returning rent lamports to the creator.

**Accounts required**

| Account | Role |
|---------|------|
| `split` | PDA — closed by this instruction (writable) |
| `creator` | Original creator — receives reclaimed rent (writable, signer) |

### On-chain State (`SplitState`)

```rust
pub struct SplitState {
    pub creator: Pubkey,          // wallet that created the split
    pub split_id: String,         // human-readable slug (≤ 32 bytes)
    pub total_amount: u64,        // total bill in lamports
    pub amount_per_person: u64,   // total_amount / participants.len()
    pub participants: Vec<Pubkey>,// ordered participant wallets
    pub paid: Vec<bool>,          // paid[i] == true once participants[i] has paid
    pub created_at: i64,          // Unix timestamp
    pub bump: u8,                 // PDA bump seed
}
```

### Custom Errors

| Error | Condition |
|-------|-----------|
| `SplitIdTooLong` | `split_id` longer than 32 characters |
| `NoParticipants` | Empty participant list |
| `TooManyParticipants` | More than 10 participants |
| `InvalidAmount` | `total_amount` is zero |
| `NotAParticipant` | Signer not in the participant list |
| `AlreadyPaid` | Participant already settled their share |
| `NotFullyPaid` | Attempting to close while payments are outstanding |

### Events

| Event | Emitted when |
|-------|-------------|
| `SplitCreated` | A new split is successfully created |
| `PaymentMade` | A participant completes their payment |

---

## Prerequisites

Make sure the following tools are installed:

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup component add rustfmt clippy

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Node.js ≥ 18 (already required for the frontend)
```

---

## Getting Started — Backend

```bash
# 1. Generate a local Solana keypair (skip if you already have one)
solana-keygen new --outfile ~/.config/solana/id.json

# 2. Point the CLI at Devnet
solana config set --url devnet

# 3. Airdrop some SOL for deploying
solana airdrop 2

# 4. Build the smart contract
anchor build

# 5. Sync the declared program ID with the generated keypair
anchor keys sync

# 6. Deploy to Devnet
anchor deploy

# 7. Run integration tests (spins up a local validator automatically)
anchor test
```

---

## Getting Started — Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and connect your Phantom wallet (set to **Devnet**).

## Build Frontend

```bash
npm run build
```

---

## Integrating the Frontend with the Anchor Program

Install the Anchor client library in the frontend:

```bash
npm install @coral-xyz/anchor
```

Example: calling `create_split` from React

```ts
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "./idl/microsplit.json"; // generated by `anchor build`

const PROGRAM_ID = new anchor.web3.PublicKey(
  "MSPLit11111111111111111111111111111111111111"
);

function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  if (!wallet) return null;
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  return new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
}

async function createSplit(
  program: anchor.Program,
  splitId: string,
  totalLamports: number,
  participants: anchor.web3.PublicKey[]
) {
  const [splitPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("split"),
      program.provider.publicKey!.toBuffer(),
      Buffer.from(splitId),
    ],
    program.programId
  );

  await program.methods
    .createSplit(splitId, new anchor.BN(totalLamports), participants)
    .accounts({
      split: splitPda,
      creator: program.provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
}
```

---

## Linting & Tests

```bash
# Frontend lint
npm run lint

# Rust lint
cargo clippy --manifest-path programs/microsplit/Cargo.toml -- -D warnings

# Rust format check
cargo fmt --manifest-path programs/microsplit/Cargo.toml -- --check

# Anchor integration tests
anchor test
```

---

> **Note:** This project targets **Solana Devnet**. Ensure Phantom is switched to Devnet before connecting.
