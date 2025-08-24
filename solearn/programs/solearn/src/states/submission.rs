use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Submission {
    pub user_wallet_key: Pubkey,
    pub user_key: Pubkey,
    pub bounty_key: Pubkey,
    #[max_len(500)]
    pub description: String,
    #[max_len(280)]
    pub work_url: String,
    pub bump: u8,
}