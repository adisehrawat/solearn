use anchor_lang::prelude::*;
use crate::states::{Bounty, Client};
use crate::errors::BountyError;

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteBounty<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"client", authority.key().as_ref()],
        bump,
    )]
    pub client: Account<'info, Client>,
    #[account(
        mut,
        close = authority,
        seeds = [b"bounty", title.as_bytes(), authority.key().as_ref()],
        bump = bounty.bump,
        constraint = bounty.client_key == client.key(),
        constraint = bounty.live == true,
    )]
    pub bounty: Account<'info, Bounty>,
    /// CHECK: This is the escrow account that holds SOL for the bounty reward
    #[account(
        mut,
        seeds = [b"escrow", bounty.key().as_ref()],
        bump,
    )]
    pub escrow_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn delete_bounty(ctx: Context<DeleteBounty>,_title: String) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let client = &mut ctx.accounts.client;
    
    require!(
        bounty.live == true,
        BountyError::BountyAlreadyClosed
    );
    
    require!(
        bounty.no_of_submissions == 0,
        BountyError::CannotDeleteWithSubmissions
    );

    let escrow_balance = ctx.accounts.escrow_account.lamports();
    if escrow_balance > 0 {
        **ctx.accounts.escrow_account.try_borrow_mut_lamports()? = 0;
        **ctx.accounts.authority.try_borrow_mut_lamports()? = ctx.accounts.authority.lamports()
            .checked_add(escrow_balance)
            .unwrap();
    }

    client.bounties_posted = client.bounties_posted.checked_sub(1).unwrap();

    Ok(())
}


