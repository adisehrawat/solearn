use anchor_lang::prelude::*;

#[error_code]
pub enum UserError {
    #[msg("User already exists")]
    UserAlreadyExists,
    #[msg("User not found")]
    UserNotFound,
    #[msg("Invalid user authority")]
    InvalidUserAuthority,
    #[msg("Email already taken")]
    EmailAlreadyTaken,
    #[msg("Invalid email format")]
    InvalidEmailFormat,
    #[msg("Invalid name format")]
    InvalidNameFormat,
    #[msg("User profile is incomplete")]
    IncompleteProfile,
    #[msg("User does not have required skills")]
    InsufficientSkills,
    #[msg("User has no submissions")]
    NoSubmissions,
    #[msg("Invalid bio format")]
    InvalidBioFormat,
}
