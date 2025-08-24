use anchor_lang::prelude::*;
use crate::states::{Client, Social, Country, Industries};
use crate::errors::ClientError;


pub fn update_client(ctx: Context<UpdateClient>, company_name: String, company_email: String, company_link: String, company_bio: String) -> Result<()> {    
    let client = &mut ctx.accounts.client;
    
    // Validate input
    require!(!company_name.is_empty(), ClientError::InvalidCompanyNameFormat);
    require!(!company_email.is_empty(), ClientError::InvalidCompanyEmailFormat);
    require!(!company_link.is_empty(), ClientError::InvalidCompanyLinkFormat);
    require!(company_name.len() <= 32, ClientError::InvalidCompanyNameFormat);
    require!(company_email.len() <= 100, ClientError::InvalidCompanyEmailFormat);
    require!(company_link.len() <= 100, ClientError::InvalidCompanyLinkFormat);
    require!(company_bio.len() <= 280, ClientError::InvalidCompanyNameFormat);
    
    client.authority = ctx.accounts.authority.key();
    client.company_name = company_name.clone();
    client.company_email = company_email;
    client.company_avatar = process_avatar(&company_name);
    client.company_link = company_link;
    client.company_bio = company_bio;
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
pub struct UpdateClient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"client", authority.key().as_ref()],
        realloc = 8 + Client::INIT_SPACE,
        realloc::payer = authority,
        realloc::zero = true,
        bump
    )]
    pub client: Account<'info, Client>,
    pub system_program: Program<'info, System>,
}