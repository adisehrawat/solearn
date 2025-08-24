use anchor_lang::prelude::*;

pub mod instructions;
pub mod states;
pub mod errors;

use instructions::*;
use states::*;

declare_id!("3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j");

#[program]
pub mod solearn {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, name: String, email: String, skills: Vec<String>) -> Result<()> {
        instructions::user::create_user::create_user(ctx, name, email, skills)
    }

    pub fn update_user(ctx: Context<UpdateUser>, name: String, email: String, bio: String, skills: Vec<String>) -> Result<()> {
        instructions::user::update_user::update_user(ctx, name, email, bio, skills)
    }

    pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
        instructions::user::delete_user::delete_user(ctx)
    }

    pub fn create_client(ctx: Context<CreateClient>, company_name: String, company_email: String, company_link: String) -> Result<()> {
        instructions::client::create_client(ctx,company_name,company_email,company_link)
    }

    pub fn update_client(ctx: Context<UpdateClient>, company_name: String, company_email: String, company_link: String, company_bio: String) -> Result<()> {
        instructions::client::update_client(ctx, company_name, company_email, company_link, company_bio)
    }

    pub fn delete_client(ctx: Context<DeleteClient>) -> Result<()> {
        instructions::client::delete_client(ctx)
    }

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        title: String,
        description: String,
        reward: u64,
        deadline: u64,
        skills_needed: Vec<String>,
    ) -> Result<()> {
        instructions::bounty::create_bounty::create_bounty(ctx, title, description, reward, deadline, skills_needed)
    }

    pub fn update_bounty(
        ctx: Context<UpdateBounty>,
        new_title: String,
        new_description: String,
        new_deadline: u64,
    ) -> Result<()> {
        instructions::bounty::update_bounty::update_bounty(ctx, new_title, new_description, new_deadline)
    }

    pub fn delete_bounty(ctx: Context<DeleteBounty>,title: String) -> Result<()> {
        instructions::bounty::delete_bounty::delete_bounty(ctx,title)
    }

    pub fn create_submission(
        ctx: Context<CreateSubmission>,
        submission_desc: String,
        submission_link: String,
    ) -> Result<()> {
        instructions::bounty::create_submission::create_submission(ctx, submission_desc, submission_link)
    }

    pub fn select_submission(ctx: Context<SelectSubmission>) -> Result<()> {
        instructions::bounty::select_submission::select_submission(ctx)
    }

    
}
