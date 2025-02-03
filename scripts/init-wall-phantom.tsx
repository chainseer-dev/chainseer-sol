import React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { prophecySol } from "../target/types/prophecy_sol";
import idl from "../target/idl/prophecy_sol.json";

// These are the exact values we want to use
const PROGRAM_ID = "8RfAJa9Zm4ZpDreRaYbE1g6T5EMgwchMu6jZwTA5kqi9";
const DEV_WALLET = "6BtnH9JpfyffWDzn6SC4K5J9bZ8Ljgd34u4ee5RQddxY";
const WALL_ID = 1;

export const InitWallPhantom: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const initializeWall = async () => {
    if (!publicKey || !wallet.signTransaction) {
      console.error("Wallet not connected");
      return;
    }

    // Verify we're using the correct wallet
    if (publicKey.toString() !== DEV_WALLET) {
      console.error(
        `Wrong wallet connected. Expected ${DEV_WALLET} but got ${publicKey.toString()}`
      );
      return;
    }

    try {
      // Calculate the PDA
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("wall"),
          new PublicKey(DEV_WALLET).toBuffer(),
          new anchor.BN(WALL_ID).toArrayLike(Buffer, "le", 8),
        ],
        new PublicKey(PROGRAM_ID)
      );

      console.log("Expected configuration:");
      console.log("Program ID:", PROGRAM_ID);
      console.log("Dev Wallet:", DEV_WALLET);
      console.log("Wall ID:", WALL_ID);
      console.log("Expected Wall PDA:", expectedPda.toString());

      // Check if wall already exists
      const accountInfo = await connection.getAccountInfo(expectedPda);
      if (accountInfo !== null) {
        console.log("\nWall already exists!");
        console.log("Owner:", accountInfo.owner.toString());
        return;
      }

      // Initialize Anchor
      const provider = new anchor.AnchorProvider(
        connection,
        wallet as anchor.Wallet,
        { commitment: "confirmed" }
      );
      const program = new Program(idl as prophecySol, PROGRAM_ID, provider);

      // Initialize the wall
      const tx = await program.methods
        .initializeWall(new anchor.BN(WALL_ID))
        .accountsStrict({
          wall: expectedPda,
          devWallet: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("\nWall initialized successfully!");
      console.log("Transaction signature:", tx);

      // Verify the wall was created
      const wallAccount = await connection.getAccountInfo(expectedPda);
      if (wallAccount === null) {
        throw new Error("Wall account not found after initialization!");
      }

      console.log("\nFinal verification:");
      console.log("Wall PDA:", expectedPda.toString());
      console.log("Owner:", wallAccount.owner.toString());
    } catch (e) {
      console.error("\nError:", e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button
        onClick={initializeWall}
        disabled={!publicKey || publicKey.toString() !== DEV_WALLET}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Initialize Wall
      </button>
      <p className="text-sm text-gray-600">
        Connect wallet {DEV_WALLET} to initialize the wall
      </p>
    </div>
  );
};
