use anchor_lang::prelude::*;
use crate::states::User;
use crate::errors::UserError;


pub fn create_user(ctx: Context<CreateUser>, name: String, email: String, skills: Vec<String>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let clock = Clock::get()?;

    // Validate input
    require!(!name.is_empty(), UserError::InvalidNameFormat);
    require!(!email.is_empty(), UserError::InvalidEmailFormat);
    require!(name.len() <= 32, UserError::InvalidNameFormat);
    require!(email.len() <= 100, UserError::InvalidEmailFormat);

    user.authority = ctx.accounts.authority.key();
    user.name = name.clone();
    user.email = email;
    user.avatar = process_avatar(&name);
    user.bio = "Hi I'm a new user".to_string();
    user.skills = skills;
    user.earned = 0;
    user.bounties_submitted = 0;
    user.bounties_completed = 0;
    user.joined_at = clock.unix_timestamp as u64;
    user.bump = ctx.bumps.user;
    Ok(())
}
fn process_avatar(input: &str) -> String {
    let trimmed = input.trim();
    if trimmed.contains(' ') {
        trimmed
            .split_whitespace()
            .filter_map(|word| word.chars().next())
            .collect()
    } else {
        trimmed.chars().take(2).collect()
    }
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", authority.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}