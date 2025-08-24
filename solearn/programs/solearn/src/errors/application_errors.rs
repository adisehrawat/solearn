use anchor_lang::prelude::*;

#[error_code]
pub enum ApplicationError {
    #[msg("Application is already approved")]
    ApplicationAlreadyApproved,
    #[msg("Application is already rejected")]
    ApplicationAlreadyRejected,
    #[msg("Application is not pending")]
    ApplicationNotPending,
    #[msg("Cannot approve application that is not pending")]
    CannotApproveNonPending,
    #[msg("Cannot reject application that is not pending")]
    CannotRejectNonPending,
    #[msg("Application deadline has passed")]
    ApplicationDeadlinePassed,
    #[msg("Application is not found")]
    ApplicationNotFound,
    #[msg("Invalid application status")]
    InvalidApplicationStatus,
    #[msg("User has already applied to this bounty")]
    UserAlreadyApplied,
    #[msg("Bounty is not accepting applications")]
    BountyNotAcceptingApplications,
    #[msg("Application fee is insufficient")]
    InsufficientApplicationFee,
    #[msg("Application description is too long")]
    ApplicationDescriptionTooLong,
    #[msg("Application link is invalid")]
    InvalidApplicationLink,
    #[msg("Work is already submitted")]
    WorkAlreadySubmitted,
    #[msg("Work is not submitted")]
    WorkNotSubmitted,
    #[msg("Work is already approved")]
    WorkAlreadyApproved,
    #[msg("Work is already rejected")]
    WorkAlreadyRejected,
    #[msg("Work is not approved")]
    WorkNotApproved,
    #[msg("Cannot submit work for non-approved application")]
    CannotSubmitWorkForNonApprovedApplication,
    #[msg("Work description is too long")]
    WorkDescriptionTooLong,
    #[msg("Work link is invalid")]
    InvalidWorkLink,
    #[msg("Additional files link is invalid")]
    InvalidAdditionalFilesLink,
}
