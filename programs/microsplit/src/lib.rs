use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("MSPLit11111111111111111111111111111111111111");

/// MicroSplit — on-chain expense-splitting program on Solana.
///
/// ## Instructions
/// - [`create_split`]  — Creator initialises a new split with participants.
/// - [`pay_split`]     — A participant pays their share to the creator.
/// - [`close_split`]   — Creator closes a fully paid split and reclaims rent.
#[program]
pub mod microsplit {
    use super::*;

    /// Creates a new expense-split account on-chain.
    ///
    /// A PDA is derived from `["split", creator, split_id]` so each
    /// (creator, split_id) pair is globally unique.
    ///
    /// # Arguments
    /// * `split_id`     — Unique slug for this split (max 32 bytes, URL-safe).
    /// * `total_amount` — Total bill in lamports (1 SOL = 1_000_000_000 lamports).
    /// * `participants` — Ordered list of participant public keys (1–10 wallets).
    pub fn create_split(
        ctx: Context<CreateSplit>,
        split_id: String,
        total_amount: u64,
        participants: Vec<Pubkey>,
    ) -> Result<()> {
        require!(split_id.len() <= 32, MicroSplitError::SplitIdTooLong);
        require!(!participants.is_empty(), MicroSplitError::NoParticipants);
        require!(
            participants.len() <= 10,
            MicroSplitError::TooManyParticipants
        );
        require!(total_amount > 0, MicroSplitError::InvalidAmount);

        let n = participants.len() as u64;
        let split = &mut ctx.accounts.split;

        split.creator = ctx.accounts.creator.key();
        split.split_id = split_id.clone();
        split.total_amount = total_amount;
        split.amount_per_person = total_amount / n;
        split.participants = participants;
        split.paid = vec![false; n as usize];
        split.created_at = Clock::get()?.unix_timestamp;
        split.bump = ctx.bumps.split;

        emit!(SplitCreated {
            split_id,
            creator: split.creator,
            total_amount,
            num_participants: n,
            amount_per_person: split.amount_per_person,
        });

        Ok(())
    }

    /// Records a participant's payment.
    ///
    /// Transfers `amount_per_person` lamports from the participant to the
    /// creator using a CPI into the System Program, then marks the participant
    /// as paid.
    ///
    /// # Arguments
    /// * `split_id` — Identifier of the split being paid (used for PDA seeds).
    pub fn pay_split(ctx: Context<PaySplit>, split_id: String) -> Result<()> {
        let payer_key = ctx.accounts.payer.key();

        // Locate this participant inside the split
        let idx = {
            let split = &ctx.accounts.split;
            split
                .participants
                .iter()
                .position(|p| p == &payer_key)
                .ok_or(MicroSplitError::NotAParticipant)?
        };

        require!(!ctx.accounts.split.paid[idx], MicroSplitError::AlreadyPaid);

        let amount = ctx.accounts.split.amount_per_person;

        // Transfer SOL: participant → creator
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                },
            ),
            amount,
        )?;

        // Mark as paid
        let split = &mut ctx.accounts.split;
        split.paid[idx] = true;

        // `split_id` must be present in the function signature so that the
        // `#[instruction(split_id)]` attribute on `PaySplit` can use it to
        // re-derive the PDA seeds at runtime.  Anchor does not use it inside
        // the function body, so we explicitly discard it here.
        let _ = split_id;

        emit!(PaymentMade {
            split_id: split.split_id.clone(),
            payer: payer_key,
            amount,
            participant_index: idx as u8,
        });

        Ok(())
    }

    /// Closes a fully paid split account and returns rent to the creator.
    ///
    /// Can only be called by the original creator once every participant
    /// has paid.
    pub fn close_split(ctx: Context<CloseSplit>) -> Result<()> {
        require!(
            ctx.accounts.split.paid.iter().all(|&p| p),
            MicroSplitError::NotFullyPaid
        );
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account contexts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(split_id: String)]
pub struct CreateSplit<'info> {
    /// The new split state PDA, derived from `[b"split", creator, split_id]`.
    #[account(
        init,
        payer = creator,
        space = SplitState::space(&split_id, 10),
        seeds = [b"split", creator.key().as_ref(), split_id.as_bytes()],
        bump
    )]
    pub split: Account<'info, SplitState>,

    /// The wallet that creates and funds the split account.
    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(split_id: String)]
pub struct PaySplit<'info> {
    /// The split PDA that records payment state.
    #[account(
        mut,
        seeds = [b"split", creator.key().as_ref(), split_id.as_bytes()],
        bump = split.bump,
        has_one = creator
    )]
    pub split: Account<'info, SplitState>,

    /// The creator of the split; receives the payment.
    /// CHECK: Validated via `has_one = creator` on the split account.
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    /// The participant making the payment.
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseSplit<'info> {
    /// The split account to close; rent is returned to the creator.
    #[account(
        mut,
        close = creator,
        has_one = creator
    )]
    pub split: Account<'info, SplitState>,

    /// Must be the original creator; receives the reclaimed rent lamports.
    #[account(mut)]
    pub creator: Signer<'info>,
}

// ---------------------------------------------------------------------------
// On-chain state
// ---------------------------------------------------------------------------

/// Stores the full state of one expense-split on-chain.
#[account]
pub struct SplitState {
    /// Wallet that created this split.
    pub creator: Pubkey,
    /// Human-readable slug (max 32 bytes).
    pub split_id: String,
    /// Total bill in lamports.
    pub total_amount: u64,
    /// Lamports owed per participant (`total_amount / participants.len()`).
    pub amount_per_person: u64,
    /// Ordered list of participant wallets.
    pub participants: Vec<Pubkey>,
    /// `paid[i]` is `true` once `participants[i]` has called `pay_split`.
    pub paid: Vec<bool>,
    /// Unix timestamp at the moment of creation.
    pub created_at: i64,
    /// PDA bump seed, stored for off-chain re-derivation convenience.
    pub bump: u8,
}

impl SplitState {
    /// Returns the number of bytes needed to store a `SplitState`.
    ///
    /// `max_participants` is the capacity allocated in `participants` and
    /// `paid` vectors. For most splits ≤ 10 participants is sufficient.
    pub fn space(split_id: &str, max_participants: usize) -> usize {
        8                               // Anchor discriminator
        + 32                            // creator: Pubkey
        + 4 + split_id.len()            // split_id: String (length prefix + bytes)
        + 8                             // total_amount: u64
        + 8                             // amount_per_person: u64
        + 4 + (32 * max_participants)   // participants: Vec<Pubkey>
        + 4 + max_participants          // paid: Vec<bool>
        + 8                             // created_at: i64
        + 1                             // bump: u8
    }
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum MicroSplitError {
    #[msg("Split ID must be 32 characters or fewer")]
    SplitIdTooLong,
    #[msg("At least one participant is required")]
    NoParticipants,
    #[msg("A maximum of 10 participants is allowed per split")]
    TooManyParticipants,
    #[msg("Total amount must be greater than zero")]
    InvalidAmount,
    #[msg("The signing wallet is not a participant in this split")]
    NotAParticipant,
    #[msg("This participant has already paid their share")]
    AlreadyPaid,
    #[msg("Cannot close a split that still has outstanding payments")]
    NotFullyPaid,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/// Emitted when a new split is created.
#[event]
pub struct SplitCreated {
    pub split_id: String,
    pub creator: Pubkey,
    pub total_amount: u64,
    pub num_participants: u64,
    pub amount_per_person: u64,
}

/// Emitted when a participant completes their payment.
#[event]
pub struct PaymentMade {
    pub split_id: String,
    pub payer: Pubkey,
    pub amount: u64,
    pub participant_index: u8,
}
