use anchor_lang::prelude::*;

#[error_code]
pub enum ClientError {
    #[msg("Client already exists")]
    ClientAlreadyExists,
    #[msg("Client not found")]
    ClientNotFound,
    #[msg("Invalid client authority")]
    InvalidClientAuthority,
    #[msg("Company username already taken")]
    CompanyUsernameAlreadyTaken,
    #[msg("Invalid company name format")]
    InvalidCompanyNameFormat,
    #[msg("Invalid company email format")]
    InvalidCompanyEmailFormat,
    #[msg("Invalid company link format")]
    InvalidCompanyLinkFormat,
    #[msg("Client profile is incomplete")]
    IncompleteProfile,
    #[msg("Client has no bounties")]
    NoBounties,
    #[msg("Client is not authorized for this bounty")]
    NotAuthorizedForBounty,
}
