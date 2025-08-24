use anchor_lang::prelude::*;
use crate::states::{Client, Social, Country, Industries};
use crate::errors::ClientError;


pub fn create_client(ctx: Context<CreateClient>, company_name: String, company_email: String, company_link: String) -> Result<()> {
    let client = &mut ctx.accounts.client;
    let clock = Clock::get()?;

    // Validate input
    require!(!company_name.is_empty(), ClientError::InvalidCompanyNameFormat);
    require!(!company_email.is_empty(), ClientError::InvalidCompanyEmailFormat);
    require!(!company_link.is_empty(), ClientError::InvalidCompanyLinkFormat);
    require!(company_name.len() <= 32, ClientError::InvalidCompanyNameFormat);
    require!(company_email.len() <= 100, ClientError::InvalidCompanyEmailFormat);
    require!(company_link.len() <= 100, ClientError::InvalidCompanyLinkFormat);

    client.authority = ctx.accounts.authority.key();
    client.company_name = company_name.clone();
    client.company_email = company_email;
    client.company_avatar = process_avatar(&company_name);
    client.company_link = company_link;
    client.company_bio = "Hi I'm a new client".to_string();
    client.rewarded = 0;
    client.bounties_posted = 0;
    client.joined_at = clock.unix_timestamp as u64;
    client.bump = ctx.bumps.client;
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
pub struct CreateClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Client::INIT_SPACE,
        seeds = [b"client", authority.key().as_ref()],
        bump
    )]
    pub client: Account<'info, Client>,
    pub system_program: Program<'info, System>,
}