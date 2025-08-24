use anchor_lang::prelude::*;

#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum BountyStatus {
    Open,
    Closed,
}
#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum ProjectStatus {
    Open,
    Closed,
}

#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
}


#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Country {
    India,
    USA,
    UK,
    Canada,
    Australia,
    NewZealand,
    Other,
}

impl Default for Country {
    fn default() -> Self {
        Country::Other
    }
}


#[derive(InitSpace, Default, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Social {
    #[max_len(32)]
    pub twitter: String,
    #[max_len(32)]
    pub facebook: String,
    #[max_len(32)]
    pub linkedin: String,
    #[max_len(32)]
    pub website: String,
}

#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Industries {
    DAO,
    Defi,
    Infrastructure,
    DePin,
    WalletAndPayment,
    Nfts,
    Other,
}

impl Default for Industries {
    fn default() -> Self {
        Industries::Other
    }
}