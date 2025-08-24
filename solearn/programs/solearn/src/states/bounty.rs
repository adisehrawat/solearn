use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub creator_wallet_key: Pubkey,
    pub client_key: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub reward: u64,
    pub live: bool,
    pub created_at: u64,
    pub deadline: u64,
    #[max_len(10, 32)]
    pub required_skills: Vec<String>,
    pub no_of_submissions: u64,
    pub selected_submission: Pubkey,
    pub selected_user_wallet_key: Pubkey,
    pub escrow_account: Pubkey,
    pub bounty_rewarded: bool,
    pub bump: u8,
}