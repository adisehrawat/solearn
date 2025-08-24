use anchor_lang::prelude::*;

#[error_code]
pub enum SubmissionError {
    #[msg("Submission already exists")]
    SubmissionAlreadyExists,
    #[msg("Submission not found")]
    SubmissionNotFound,
    #[msg("Invalid submission for selected user")]
    InvalidSubmission,
    #[msg("Submission deadline has passed")]
    SubmissionDeadlinePassed,
    #[msg("User does not have required skills for this bounty")]
    InsufficientSkills,
    #[msg("Submission description is too long")]
    DescriptionTooLong,
    #[msg("Submission link is invalid")]
    InvalidSubmissionLink,
    #[msg("User has already submitted for this bounty")]
    AlreadySubmitted,
    #[msg("Submission is not for the specified bounty")]
    WrongBounty,
}
