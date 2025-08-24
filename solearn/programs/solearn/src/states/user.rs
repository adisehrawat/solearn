use anchor_lang::prelude::*;
use crate::states::{ Social, Country};

// User account
#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(100)]
    pub email: String,
    #[max_len(32)]
    pub avatar: String,
    #[max_len(280)]
    pub bio: String,
    #[max_len(10, 32)]
    pub skills: Vec<String>,
    pub joined_at: u64,
    pub earned: u64,
    pub bounties_submitted: u64,
    pub bounties_completed: u64,
    pub bump: u8,
}

