use anchor_lang::prelude::*;

#[error_code]
pub enum BountyError {
    #[msg("Bounty is already closed")]
    BountyAlreadyClosed,
    #[msg("Cannot update bounty that has submissions")]
    CannotUpdateWithSubmissions,
    #[msg("Cannot delete bounty that has submissions")]
    CannotDeleteWithSubmissions,
    #[msg("Bounty deadline has passed")]
    BountyDeadlinePassed,
    #[msg("Bounty is not live")]
    BountyNotLive,
    #[msg("Bounty has already been rewarded")]
    BountyAlreadyRewarded,
    #[msg("Invalid reward amount")]
    InvalidRewardAmount,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Insufficient SOL balance for reward")]
    InsufficientSolBalance,
    #[msg("Escrow account not found")]
    EscrowAccountNotFound,
    #[msg("Invalid escrow account")]
    InvalidEscrowAccount,
}
