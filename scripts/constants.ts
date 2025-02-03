import path from "path";
import fs from "fs";

// Ensure .test_wallets directory exists
const WALLETS_DIR = path.join(__dirname, "..", ".test_wallets");
if (!fs.existsSync(WALLETS_DIR)) {
  fs.mkdirSync(WALLETS_DIR);
}

export const TEST_WALLET_PATH = path.join(
  WALLETS_DIR,
  "single-use-Bmt5KnyL.json"
);
export const DEV_WALLET_PATH = path.join(WALLETS_DIR, "wall-owner.json");
