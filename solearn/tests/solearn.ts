import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solearn } from "../target/types/solearn";
import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { assert, expect } from "chai";

describe("solearn", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Solearn as Program<Solearn>;
  const provider = anchor.AnchorProvider.env();

  // Test accounts
  let user1: Keypair;
  let user2: Keypair;
  let user3: Keypair;
  let user1Pda: PublicKey;
  let user2Pda: PublicKey;
  let user3Pda: PublicKey;

  before(async () => {
    // Generate test keypairs
    user1 = Keypair.generate();
    user2 = Keypair.generate();
    user3 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user1.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user2.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user3.publicKey, 2 * LAMPORTS_PER_SOL)
    );

    // Derive PDAs for users
    [user1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user1.publicKey.toBuffer()],
      program.programId
    );
    [user2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user2.publicKey.toBuffer()],
      program.programId
    );
    [user3Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user3.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("User Management", () => {
    describe("Create User", () => {
      it("Should create a user successfully with valid data", async () => {
        const name = "John Doe";
        const email = "john.doe@example.com";
        const skills = ["Rust", "Solana", "Web3"];

        await program.methods
          .createUser(name, email, skills)
          .accountsStrict({
            authority: user1.publicKey,
            user: user1Pda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        const userAccount = await program.account.user.fetch(user1Pda);
        expect(userAccount.authority.toString()).to.equal(user1.publicKey.toString());
        expect(userAccount.name).to.equal(name);
        expect(userAccount.email).to.equal(email);
        expect(userAccount.skills).to.deep.equal(skills);
        expect(userAccount.avatar).to.equal("JD");
        expect(userAccount.bio).to.equal("Hi I'm a new user");
      });

      it("Should create a user with single name and generate correct avatar", async () => {
        const name = "Alice";
        const email = "alice@example.com";
        const skills = ["JavaScript", "React"];

        await program.methods
          .createUser(name, email, skills)
          .accountsStrict({
            authority: user2.publicKey,
            user: user2Pda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        const userAccount = await program.account.user.fetch(user2Pda);
        expect(userAccount.avatar).to.equal("Al");
        expect(userAccount.name).to.equal(name);
      });

      it("Should create a user with empty skills array", async () => {
        const name = "Bob Smith";
        const email = "bob.smith@example.com";
        const skills: string[] = [];

        await program.methods
          .createUser(name, email, skills)
          .accountsStrict({
            authority: user3.publicKey,
            user: user3Pda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user3])
          .rpc();

        const userAccount = await program.account.user.fetch(user3Pda);
        expect(userAccount.skills).to.deep.equal([]);
        expect(userAccount.avatar).to.equal("BS");
      });

      it("Should fail to create user with skills array longer than 10 items", async () => {
        const name = "Test User";
        const email = "test@example.com";
        const skills = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
        const user = Keypair.generate();
        const userPda = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user.publicKey.toBuffer()],
          program.programId
        )[0];

        try {
          await program.methods
            .createUser(name, email, skills)
            .accountsStrict({
              authority: user.publicKey,
              user: userPda,
              systemProgram: SystemProgram.programId,
            })
            .signers([user])
            .rpc();
          assert.fail("Expected an error but none was thrown.");
        } catch (error) {
          // Not a specific error, but based on transaction size limits
          expect(error).to.be.an.instanceof(Error);
        }
      });
    });

    describe("Update User", () => {
      it("Should update user successfully with new data", async () => {
        const newName = "John Updated";
        const newEmail = "john.updated@example.com";
        const newBio = "This is my updated bio";
        const newSkills = ["Rust", "Solana", "Anchor"];

        await program.methods
          .updateUser(newName, newEmail, newBio, newSkills)
          .accountsStrict({
            authority: user1.publicKey,
            user: user1Pda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        const userAccount = await program.account.user.fetch(user1Pda);
        expect(userAccount.name).to.equal(newName);
        expect(userAccount.email).to.equal(newEmail);
        expect(userAccount.bio).to.equal(newBio);
        expect(userAccount.skills).to.deep.equal(newSkills);
        expect(userAccount.avatar).to.equal("JU");
      });

      it("Should fail to update user with empty name", async () => {
        try {
          await program.methods
            .updateUser("", "a@a.com", "bio", [])
            .accountsStrict({
              authority: user1.publicKey,
              user: user1Pda,
              systemProgram: SystemProgram.programId,
            })
            .signers([user1])
            .rpc();
          assert.fail("Expected an error but none was thrown.");
        } catch (error) {
          expect(error.toString()).to.include("InvalidNameFormat");
        }
      });

      it("Should fail to update user with unauthorized account", async () => {
        try {
          await program.methods
            .updateUser("new name", "new@email.com", "new bio", [])
            .accountsStrict({
              authority: user2.publicKey, // user2 trying to update user1's profile
              user: user1Pda,
              systemProgram: SystemProgram.programId,
            })
            .signers([user2])
            .rpc();
          assert.fail("Expected an error but none was thrown.");
        } catch (error) {
          expect(error.toString()).to.include("ConstraintSeeds");
        }
      });
    });

    describe("Delete User", () => {
      it("Should delete user successfully", async () => {
        await program.methods
          .deleteUser()
          .accountsStrict({
            authority: user1.publicKey,
            user: user1Pda,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        try {
          await program.account.user.fetch(user1Pda);
          assert.fail("User account should be closed");
        } catch (error) {
          expect(error.toString()).to.include("Account does not exist");
        }
      });

      it("Should fail to delete user with unauthorized account", async () => {
        try {
          await program.methods
            .deleteUser()
            .accountsStrict({
              authority: user3.publicKey, // user3 trying to delete user2's profile
              user: user2Pda,
              systemProgram: SystemProgram.programId,
            })
            .signers([user3])
            .rpc();
          assert.fail("Expected an error but none was thrown.");
        } catch (error) {
          expect(error.toString()).to.include("ConstraintSeeds");
        }
      });
    });
  });

  describe("Client Management", () => {
    let client1: Keypair;
    let client2: Keypair;
    let client1Pda: PublicKey;

    before(async () => {
      client1 = Keypair.generate();
      client2 = Keypair.generate();

      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(client1.publicKey, 2 * LAMPORTS_PER_SOL)
      );
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(client2.publicKey, 2 * LAMPORTS_PER_SOL)
      );

      [client1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("client"), client1.publicKey.toBuffer()],
        program.programId
      );
    });

    it("Should create a client successfully", async () => {
      const companyName = "Test Corp";
      const companyEmail = "contact@testcorp.com";
      const companyLink = "https://testcorp.com";

      await program.methods
        .createClient(companyName, companyEmail, companyLink)
        .accountsStrict({
          authority: client1.publicKey,
          client: client1Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client1])
        .rpc();

      const clientAccount = await program.account.client.fetch(client1Pda);
      expect(clientAccount.companyName).to.equal(companyName);
      expect(clientAccount.companyEmail).to.equal(companyEmail);
      expect(clientAccount.companyLink).to.equal(companyLink);
    });

    it("Should update a client successfully", async () => {
      const newCompanyName = "Updated Corp";
      const newCompanyEmail = "updated@testcorp.com";
      const newCompanyLink = "https://updated.com";
      const newCompanyBio = "This is an updated bio.";

      await program.methods
        .updateClient(newCompanyName, newCompanyEmail, newCompanyLink, newCompanyBio)
        .accountsStrict({
          authority: client1.publicKey,
          client: client1Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client1])
        .rpc();

      const clientAccount = await program.account.client.fetch(client1Pda);
      expect(clientAccount.companyName).to.equal(newCompanyName);
      expect(clientAccount.companyEmail).to.equal(newCompanyEmail);
      expect(clientAccount.companyLink).to.equal(newCompanyLink);
      expect(clientAccount.companyBio).to.equal(newCompanyBio);
    });

    it("Should delete a client successfully", async () => {
      await program.methods
        .deleteClient()
        .accountsStrict({
          authority: client1.publicKey,
          client: client1Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client1])
        .rpc();

      try {
        await program.account.client.fetch(client1Pda);
        assert.fail("Client account should be closed");
      } catch (error) {
        expect(error.toString()).to.include("Account does not exist");
      }
    });
  });

  describe("Bounty Management", () => {
    let bountyCreator: Keypair;
    let bountyCreatorPda: PublicKey;
    let bountyPda: PublicKey;
    let escrowPda: PublicKey;
    let submissionPda: PublicKey;
    const bountyTitle = "Test Bounty";

    before(async () => {
      bountyCreator = Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(bountyCreator.publicKey, 10 * LAMPORTS_PER_SOL)
      );

      [bountyCreatorPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("client"), bountyCreator.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createClient("Bounty Corp", "bounty@corp.com", "https://bounty-corp.com")
        .accountsStrict({
          authority: bountyCreator.publicKey,
          client: bountyCreatorPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([bountyCreator])
        .rpc();

      [bountyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bounty"), Buffer.from(bountyTitle), bountyCreator.publicKey.toBuffer()],
        program.programId
      );

      [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), bountyPda.toBuffer()],
        program.programId
      );

      // Create user for submissions
      if (!user2Pda) {
        user2 = Keypair.generate();
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user2.publicKey, 2 * LAMPORTS_PER_SOL)
        );
        [user2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user2.publicKey.toBuffer()],
            program.programId
        );
        await program.methods
            .createUser("Submitter", "submitter@test.com", ["Rust"])
            .accountsStrict({
                authority: user2.publicKey,
                user: user2Pda,
                systemProgram: SystemProgram.programId,
            })
            .signers([user2])
            .rpc();
    }


      [submissionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("submission"), user2.publicKey.toBuffer(), bountyPda.toBuffer()],
        program.programId
      );
    });

    it("Should create a bounty successfully", async () => {
      const description = "This is a test bounty.";
      const reward = new BN(1); // 1 SOL
      const deadline = new BN(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      const skills = ["Rust", "Solana"];

      await program.methods
        .createBounty(bountyTitle, description, reward, deadline, skills)
        .accountsStrict({
          authority: bountyCreator.publicKey,
          client: bountyCreatorPda,
          bounty: bountyPda,
          escrowAccount: escrowPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([bountyCreator])
        .rpc();

      const bountyAccount = await program.account.bounty.fetch(bountyPda);
      expect(bountyAccount.title).to.equal(bountyTitle);
      expect(bountyAccount.description).to.equal(description);
    });

    it("Should create a submission successfully", async () => {
      const description = "My submission for the bounty.";
      const workUrl = "https://github.com/test/submission";

      await program.methods
        .createSubmission(description, workUrl)
        .accountsStrict({
          authority: user2.publicKey,
          user: user2Pda,
          bounty: bountyPda,
          submission: submissionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const submissionAccount = await program.account.submission.fetch(submissionPda);
      expect(submissionAccount.description).to.equal(description);
      expect(submissionAccount.workUrl).to.equal(workUrl);

      const bountyAccount = await program.account.bounty.fetch(bountyPda);
      expect(bountyAccount.noOfSubmissions.toString()).to.equal("1");
    });

    it("Should select a submission and reward the user", async () => {
      // Get the submission account to find the user_key
      const submissionAccount = await program.account.submission.fetch(submissionPda);
      
      await program.methods
        .selectSubmission()
        .accountsStrict({
          authority: bountyCreator.publicKey,
          client: bountyCreatorPda,
          bounty: bountyPda,
          submission: submissionPda,
          selectedUser: submissionAccount.userKey,
          selectedUserWallet: user2.publicKey,
          escrowAccount: escrowPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([bountyCreator])
        .rpc();

      const userAccount = await program.account.user.fetch(user2Pda);
      expect(userAccount.bountiesCompleted.toString()).to.equal("1");
      expect(userAccount.bountiesCompleted.toString()).to.equal("1");
    });

    it("Should fail to delete a bounty with submissions", async () => {
        // Re-create a bounty to test deletion failure
        const newBountyTitle = "Delete Fail Bounty";
        const newBountyPda = PublicKey.findProgramAddressSync(
            [Buffer.from("bounty"), Buffer.from(newBountyTitle), bountyCreator.publicKey.toBuffer()],
            program.programId
        )[0];
        const newEscrowPda = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), newBountyPda.toBuffer()],
            program.programId
        )[0];
        const newSubmissionPda = PublicKey.findProgramAddressSync(
            [Buffer.from("submission"), user2.publicKey.toBuffer(), newBountyPda.toBuffer()],
            program.programId
        )[0];

        await program.methods
            .createBounty(newBountyTitle, "desc", new BN(1), new BN(Date.now() / 1000 + 3600), [])
            .accountsStrict({
                authority: bountyCreator.publicKey,
                client: bountyCreatorPda,
                bounty: newBountyPda,
                escrowAccount: newEscrowPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([bountyCreator])
            .rpc();

        await program.methods
            .createSubmission("desc", "url")
            .accountsStrict({
                authority: user2.publicKey,
                user: user2Pda,
                bounty: newBountyPda,
                submission: newSubmissionPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([user2])
            .rpc();

        try {
            await program.methods
                .deleteBounty(newBountyTitle)
                .accountsStrict({
                    authority: bountyCreator.publicKey,
                    client: bountyCreatorPda,
                    bounty: newBountyPda,
                    escrowAccount: newEscrowPda,
                    systemProgram: SystemProgram.programId,
                })
                .signers([bountyCreator])
                .rpc();
            assert.fail("Expected an error but none was thrown.");
        } catch (error) {
            expect(error.toString()).to.include("CannotDeleteWithSubmissions");
        }
    });

    it("Should delete a bounty successfully when there are no submissions", async () => {
        const newBountyTitle = "Delete Success Bounty";
        const newBountyPda = PublicKey.findProgramAddressSync(
            [Buffer.from("bounty"), Buffer.from(newBountyTitle), bountyCreator.publicKey.toBuffer()],
            program.programId
        )[0];
        const newEscrowPda = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), newBountyPda.toBuffer()],
            program.programId
        )[0];

        await program.methods
            .createBounty(newBountyTitle, "desc", new BN(1), new BN(Date.now() / 1000 + 3600), [])
            .accountsStrict({
                authority: bountyCreator.publicKey,
                client: bountyCreatorPda,
                bounty: newBountyPda,
                escrowAccount: newEscrowPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([bountyCreator])
            .rpc();

        await program.methods
            .deleteBounty(newBountyTitle)
            .accountsStrict({
                authority: bountyCreator.publicKey,
                client: bountyCreatorPda,
                bounty: newBountyPda,
                escrowAccount: newEscrowPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([bountyCreator])
            .rpc();

        try {
            await program.account.bounty.fetch(newBountyPda);
            assert.fail("Bounty account should be closed");
        } catch (error) {
            expect(error.toString()).to.include("Account does not exist");
        }
    });
  });
});