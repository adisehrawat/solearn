use anchor_lang::prelude::*;
use crate::states::{User};


pub fn delete_user(_ctx: Context<DeleteUser>) -> Result<()> {
    Ok(())
}


#[derive(Accounts)]
pub struct DeleteUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump,
        close = authority
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}
