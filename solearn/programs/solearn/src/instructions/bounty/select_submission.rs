use anchor_lang::prelude::*;
use crate::states::{Bounty, Client, Submission, User};
use crate::errors::SubmissionError;

pub fn select_submission(ctx: Context<SelectSubmission>) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let client = &mut ctx.accounts.client;
    let selected_user = &mut ctx.accounts.selected_user;
    let submission = &ctx.accounts.submission;

    require!(
        submission.user_wallet_key == selected_user.authority,
        SubmissionError::InvalidSubmission
    );

    let reward_lamports = bounty.reward * anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
    
    // Calculate rent-exempt minimum for the escrow account
    let rent = &Rent::get()?;
    let rent_exempt_minimum = rent.minimum_balance(0); // 0 bytes of data
    
    // Transfer all SOL from escrow to user, except the rent-exempt minimum
    let escrow_balance = ctx.accounts.escrow_account.to_account_info().lamports();
    let transfer_amount = escrow_balance.saturating_sub(rent_exempt_minimum);
    
    // Transfer SOL from escrow to user by directly manipulating lamports
    // This avoids the system program transfer restriction for accounts with data
    **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -= transfer_amount;
    **ctx.accounts.selected_user_wallet.to_account_info().try_borrow_mut_lamports()? += transfer_amount;
    
    // Update user stats with the actual reward amount (not the transfer amount)
    selected_user.earned += reward_lamports;

    // Update bounty status
    bounty.selected_submission = submission.key();
    bounty.selected_user_wallet_key = selected_user.authority;
    bounty.bounty_rewarded = true;
    bounty.live = false;

    // Update user stats (already added earned above)
    selected_user.bounties_completed += 1;

    // Update client stats
    client.rewarded += reward_lamports;

    Ok(())
}




#[derive(Accounts)]
pub struct SelectSubmission<'info> {
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
        seeds = [b"bounty", bounty.title.as_bytes(), bounty.creator_wallet_key.as_ref()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,
    #[account(
        mut,
        seeds = [b"submission", selected_user.authority.as_ref(), bounty.key().as_ref()],
        bump = submission.bump,
    )]
    pub submission: Account<'info, Submission>,
    #[account(
        mut,
        seeds = [b"user", submission.user_wallet_key.as_ref()],
        bump,
    )]
    pub selected_user: Account<'info, User>,
    /// CHECK: This is the escrow account that holds SOL for the bounty reward
    #[account(
        mut,
        seeds = [b"escrow", bounty.key().as_ref()],
        bump,
    )]
    pub escrow_account: UncheckedAccount<'info>,
    /// CHECK: This is the user's wallet that will receive the reward
    #[account(mut)]
    pub selected_user_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

