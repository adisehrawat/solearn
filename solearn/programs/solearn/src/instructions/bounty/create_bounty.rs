use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};
use crate::states::{Bounty, Client};
use crate::errors::BountyError;

pub fn create_bounty(
    ctx: Context<CreateBounty>,
    title: String,
    description: String,
    reward: u64,
    deadline: u64,
    required_skills: Vec<String>,
) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let client = &mut ctx.accounts.client;
    let clock = Clock::get()?;

    // Validate reward amount
    require!(reward > 0, BountyError::InvalidRewardAmount);
    let reward_lamports = reward * LAMPORTS_PER_SOL;

    // Check if authority has sufficient SOL
    require!(
        ctx.accounts.authority.lamports() >= reward_lamports,
        BountyError::InsufficientSolBalance
    );

    // Transfer SOL from authority to escrow account
    let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.authority.key(),
        &ctx.accounts.escrow_account.key(),
        reward_lamports,
    );
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.escrow_account.to_account_info(),
        ],
    )?;

    // Initialize bounty
    bounty.creator_wallet_key = ctx.accounts.authority.key();
    bounty.client_key = client.key();
    bounty.title = title;
    bounty.description = description;
    bounty.reward = reward;
    bounty.live = true;
    bounty.created_at = clock.unix_timestamp as u64;
    bounty.deadline = deadline;
    bounty.required_skills = required_skills;
    bounty.no_of_submissions = 0;
    bounty.selected_submission = Pubkey::default();
    bounty.selected_user_wallet_key = Pubkey::default();
    bounty.escrow_account = ctx.accounts.escrow_account.key();
    bounty.bounty_rewarded = false;
    bounty.bump = ctx.bumps.bounty;
    client.bounties_posted = client.bounties_posted.checked_add(1).unwrap();

    Ok(())
}


#[derive(Accounts)]
#[instruction(title: String, reward: u64)]
pub struct CreateBounty<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"client", authority.key().as_ref()],
        bump,
    )]
    pub client: Account<'info, Client>,
    #[account(
        init,
        payer = authority,
        space = 8 + Bounty::INIT_SPACE,
        seeds = [b"bounty", title.as_bytes(), authority.key().as_ref()],
        bump,
    )]
    pub bounty: Account<'info, Bounty>,
    /// CHECK: This is the escrow account that holds SOL for the bounty reward
    #[account(
        init,
        payer = authority,
        space = 0, 
        seeds = [b"escrow", bounty.key().as_ref()],
        bump,
    )]
    pub escrow_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

