use anchor_lang::prelude::*;
use crate::states::{Bounty, User, Submission};
use crate::errors::{BountyError, SubmissionError};

pub fn create_submission(
    ctx: Context<CreateSubmission>,
    description: String,
    work_url: String,
) -> Result<()> {
    let submission = &mut ctx.accounts.submission;
    let bounty = &mut ctx.accounts.bounty;
    let user = &mut ctx.accounts.user;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp as u64 <= bounty.deadline,
        BountyError::BountyDeadlinePassed
    );

    let user_key = user.key();
    let bounty_key = bounty.key();

    submission.user_wallet_key = ctx.accounts.authority.key();
    submission.user_key = user_key;
    submission.bounty_key = bounty_key;
    submission.description = description;
    submission.work_url = work_url;
    submission.bump = ctx.bumps.submission;

    bounty.no_of_submissions = bounty.no_of_submissions.checked_add(1).unwrap();

    user.bounties_submitted = user.bounties_submitted.checked_add(1).unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct CreateSubmission<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,
    #[account(
        mut,
        seeds = [b"bounty", bounty.title.as_bytes(), bounty.creator_wallet_key.as_ref()],
        bump = bounty.bump,
        constraint = bounty.live == true,
    )]
    pub bounty: Account<'info, Bounty>,
    #[account(
        init,
        payer = authority,
        space = 8 + Submission::INIT_SPACE,
        seeds = [b"submission", authority.key().as_ref(), bounty.key().as_ref()],
        bump,
    )]
    pub submission: Account<'info, Submission>,
    pub system_program: Program<'info, System>,
}




