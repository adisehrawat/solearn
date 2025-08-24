use anchor_lang::prelude::*;
use crate::states::{Client};


pub fn delete_client(_ctx: Context<DeleteClient>) -> Result<()> {
    Ok(())
}


#[derive(Accounts)]
pub struct DeleteClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"client", authority.key().as_ref()],
        bump,
        close = authority
    )]
    pub client: Account<'info, Client>,
    pub system_program: Program<'info, System>,
}
