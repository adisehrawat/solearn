use anchor_lang::prelude::*;
use crate::states::User;
use crate::errors::UserError;


pub fn update_user(ctx: Context<UpdateUser>, name: String, email: String, bio: String, skills: Vec<String>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    
    // Validate input
    require!(!name.is_empty(), UserError::InvalidNameFormat);
    require!(!email.is_empty(), UserError::InvalidEmailFormat);
    require!(name.len() <= 32, UserError::InvalidNameFormat);
    require!(bio.len() <= 280, UserError::InvalidBioFormat);
    
    user.name = name.clone();
    user.email = email;
    user.avatar = process_avatar(&name);
    user.bio = bio;
    user.skills = skills;
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
pub struct UpdateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        realloc = 8 + User::INIT_SPACE,
        realloc::payer = authority,
        realloc::zero = true,
        bump
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}