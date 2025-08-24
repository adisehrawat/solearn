use anchor_lang::prelude::*;

#[error_code]
pub enum ProjectError {
    #[msg("Project is already closed")]
    ProjectAlreadyClosed,
    #[msg("Cannot update project that has applications")]
    CannotUpdateWithApplications,
    #[msg("Cannot delete project that has applications")]
    CannotDeleteWithApplications,
    #[msg("Project deadline has passed")]
    ProjectDeadlinePassed,
    #[msg("Project is not live")]
    ProjectNotLive,
    #[msg("Project has already been rewarded")]
    ProjectAlreadyRewarded,
    #[msg("Invalid reward amount")]
    InvalidRewardAmount,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Insufficient SOL balance for reward")]
    InsufficientSolBalance,
    #[msg("Project title is empty")]
    InvalidProjectTitle,
    #[msg("Project description is empty")]
    InvalidProjectDescription,
    #[msg("Project is not accepting applications")]
    ProjectNotAcceptingApplications,
    #[msg("User has already applied to this project")]
    UserAlreadyApplied,
    #[msg("Project not found")]
    ProjectNotFound,
    #[msg("Invalid project status")]
    InvalidProjectStatus,
}
