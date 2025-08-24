use anchor_lang::prelude::*;
use crate::states::{Bounty, Client};
use crate::errors::BountyError;

pub fn update_bounty(
    ctx: Context<UpdateBounty>,
    _title: String,
    description: String,
    deadline: u64,
) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    
    require!(
        bounty.live == true,
        BountyError::BountyAlreadyClosed
    );
    
    require!(
        bounty.no_of_submissions == 0,
        BountyError::CannotUpdateWithSubmissions
    );

    bounty.description = description;
    bounty.deadline = deadline;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateBounty<'info> {
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
        seeds = [b"bounty", title.as_bytes(), bounty.creator_wallet_key.as_ref()],
        bump = bounty.bump,
        constraint = bounty.client_key == client.key(),
        constraint = bounty.live == true,
    )]
    pub bounty: Account<'info, Bounty>,
}




