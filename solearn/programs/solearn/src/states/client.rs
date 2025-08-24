use anchor_lang::prelude::*;


// User account
#[account]
#[derive(InitSpace)]
pub struct Client {
    pub authority: Pubkey,
    #[max_len(32)]
    pub company_name: String,
    #[max_len(32)]
    pub company_email: String,
    #[max_len(32)]
    pub company_avatar: String,
    #[max_len(32)]
    pub company_link: String,
    #[max_len(280)]
    pub company_bio: String,
    pub joined_at: u64,
    pub rewarded: u64,
    pub bounties_posted: u64,
    pub bump: u8,
}
