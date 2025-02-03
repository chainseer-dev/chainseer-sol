import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { DEV_WALLET_PATH } from "./constants";
import * as fs from "fs";

const PROGRAM_ID = new PublicKey(
  "8RfAJa9Zm4ZpDreRaYbE1g6T5EMgwchMu6jZwTA5kqi9"
);
const TARGET_PDA = new PublicKey("WiByjk6qP3fKfLyuWbE3uXhT6G8PNoM8SgWQVMRFniA");

const main = async () => {
  // Load dev wallet
  const devWalletRaw = fs.readFileSync(DEV_WALLET_PATH, "utf-8");
  const devWallet = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(devWalletRaw))
  );

  // Try wall IDs from 0 to 100
  for (let i = 0; i <= 100; i++) {
    const [wallPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("wall"),
        devWallet.publicKey.toBuffer(),
        new anchor.BN(i).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );

    if (wallPda.equals(TARGET_PDA)) {
      console.log(`Found matching wall ID: ${i}`);
      console.log(`PDA: ${wallPda.toString()}`);
      process.exit(0);
    }
  }

  console.log("No matching wall ID found in range 0-100");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
