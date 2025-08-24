/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solearn.json`.
 */
export type Solearn = {
  "address": "3J4pJELCCwVFjD58iBUUa46pmrZNXwkWGwQkYm8pAc4j",
  "metadata": {
    "name": "solearn",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createBounty",
      "discriminator": [
        122,
        90,
        14,
        143,
        8,
        125,
        200,
        2
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "reward",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "u64"
        },
        {
          "name": "skillsNeeded",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "createClient",
      "discriminator": [
        155,
        165,
        72,
        245,
        11,
        206,
        91,
        141
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        },
        {
          "name": "companyEmail",
          "type": "string"
        },
        {
          "name": "companyLink",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSubmission",
      "discriminator": [
        85,
        217,
        61,
        59,
        157,
        60,
        175,
        220
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.title",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.creator_wallet_key",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "submission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "submissionDesc",
          "type": "string"
        },
        {
          "name": "submissionLink",
          "type": "string"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "email",
          "type": "string"
        },
        {
          "name": "skills",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "deleteBounty",
      "discriminator": [
        43,
        167,
        107,
        186,
        99,
        55,
        246,
        25
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteClient",
      "discriminator": [
        189,
        71,
        22,
        173,
        45,
        237,
        67,
        94
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deleteUser",
      "discriminator": [
        186,
        85,
        17,
        249,
        219,
        231,
        98,
        251
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "selectSubmission",
      "discriminator": [
        220,
        196,
        210,
        29,
        242,
        209,
        208,
        88
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.title",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.creator_wallet_key",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "submission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "selected_user.authority",
                "account": "user"
              },
              {
                "kind": "account",
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "selectedUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "submission.user_wallet_key",
                "account": "submission"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              }
            ]
          }
        },
        {
          "name": "selectedUserWallet",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateBounty",
      "discriminator": [
        162,
        254,
        23,
        153,
        115,
        85,
        83,
        203
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "bounty.creator_wallet_key",
                "account": "bounty"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newDescription",
          "type": "string"
        },
        {
          "name": "newDeadline",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateClient",
      "discriminator": [
        184,
        89,
        17,
        76,
        97,
        57,
        165,
        10
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        },
        {
          "name": "companyEmail",
          "type": "string"
        },
        {
          "name": "companyLink",
          "type": "string"
        },
        {
          "name": "companyBio",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateUser",
      "discriminator": [
        9,
        2,
        160,
        169,
        118,
        12,
        207,
        84
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "email",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        },
        {
          "name": "skills",
          "type": {
            "vec": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bounty",
      "discriminator": [
        237,
        16,
        105,
        198,
        19,
        69,
        242,
        234
      ]
    },
    {
      "name": "client",
      "discriminator": [
        221,
        237,
        145,
        143,
        170,
        194,
        133,
        115
      ]
    },
    {
      "name": "submission",
      "discriminator": [
        58,
        194,
        159,
        158,
        75,
        102,
        178,
        197
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "applicationAlreadyApproved",
      "msg": "Application is already approved"
    },
    {
      "code": 6001,
      "name": "applicationAlreadyRejected",
      "msg": "Application is already rejected"
    },
    {
      "code": 6002,
      "name": "applicationNotPending",
      "msg": "Application is not pending"
    },
    {
      "code": 6003,
      "name": "cannotApproveNonPending",
      "msg": "Cannot approve application that is not pending"
    },
    {
      "code": 6004,
      "name": "cannotRejectNonPending",
      "msg": "Cannot reject application that is not pending"
    },
    {
      "code": 6005,
      "name": "applicationDeadlinePassed",
      "msg": "Application deadline has passed"
    },
    {
      "code": 6006,
      "name": "applicationNotFound",
      "msg": "Application is not found"
    },
    {
      "code": 6007,
      "name": "invalidApplicationStatus",
      "msg": "Invalid application status"
    },
    {
      "code": 6008,
      "name": "userAlreadyApplied",
      "msg": "User has already applied to this bounty"
    },
    {
      "code": 6009,
      "name": "bountyNotAcceptingApplications",
      "msg": "Bounty is not accepting applications"
    },
    {
      "code": 6010,
      "name": "insufficientApplicationFee",
      "msg": "Application fee is insufficient"
    },
    {
      "code": 6011,
      "name": "applicationDescriptionTooLong",
      "msg": "Application description is too long"
    },
    {
      "code": 6012,
      "name": "invalidApplicationLink",
      "msg": "Application link is invalid"
    },
    {
      "code": 6013,
      "name": "workAlreadySubmitted",
      "msg": "Work is already submitted"
    },
    {
      "code": 6014,
      "name": "workNotSubmitted",
      "msg": "Work is not submitted"
    },
    {
      "code": 6015,
      "name": "workAlreadyApproved",
      "msg": "Work is already approved"
    },
    {
      "code": 6016,
      "name": "workAlreadyRejected",
      "msg": "Work is already rejected"
    },
    {
      "code": 6017,
      "name": "workNotApproved",
      "msg": "Work is not approved"
    },
    {
      "code": 6018,
      "name": "cannotSubmitWorkForNonApprovedApplication",
      "msg": "Cannot submit work for non-approved application"
    },
    {
      "code": 6019,
      "name": "workDescriptionTooLong",
      "msg": "Work description is too long"
    },
    {
      "code": 6020,
      "name": "invalidWorkLink",
      "msg": "Work link is invalid"
    },
    {
      "code": 6021,
      "name": "invalidAdditionalFilesLink",
      "msg": "Additional files link is invalid"
    }
  ],
  "types": [
    {
      "name": "bounty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creatorWalletKey",
            "type": "pubkey"
          },
          {
            "name": "clientKey",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "live",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "requiredSkills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "noOfSubmissions",
            "type": "u64"
          },
          {
            "name": "selectedSubmission",
            "type": "pubkey"
          },
          {
            "name": "selectedUserWalletKey",
            "type": "pubkey"
          },
          {
            "name": "escrowAccount",
            "type": "pubkey"
          },
          {
            "name": "bountyRewarded",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "client",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "companyName",
            "type": "string"
          },
          {
            "name": "companyEmail",
            "type": "string"
          },
          {
            "name": "companyAvatar",
            "type": "string"
          },
          {
            "name": "companyLink",
            "type": "string"
          },
          {
            "name": "companyBio",
            "type": "string"
          },
          {
            "name": "joinedAt",
            "type": "u64"
          },
          {
            "name": "rewarded",
            "type": "u64"
          },
          {
            "name": "bountiesPosted",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "submission",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userWalletKey",
            "type": "pubkey"
          },
          {
            "name": "userKey",
            "type": "pubkey"
          },
          {
            "name": "bountyKey",
            "type": "pubkey"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "workUrl",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "avatar",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "joinedAt",
            "type": "u64"
          },
          {
            "name": "earned",
            "type": "u64"
          },
          {
            "name": "bountiesSubmitted",
            "type": "u64"
          },
          {
            "name": "bountiesCompleted",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
