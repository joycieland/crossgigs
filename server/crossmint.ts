import axios from "axios";

const API_KEY = process.env.API_KEY;
const CROSSMINT_API_URL = "https://www.crossmint.com/api/v1-alpha2";

if (!API_KEY) {
  console.warn("[Crossmint] API_KEY not configured");
}

interface WalletBalance {
  nativeToken?: {
    balance: string;
    decimals: number;
    symbol: string;
  };
  usdc?: {
    balance: string;
    decimals: number;
    symbol: string;
  };
  tokens?: Array<{
    balance: string;
    decimals: number;
    symbol: string;
    contractAddress: string;
  }>;
}

interface TransferResult {
  hash: string;
  explorerLink: string;
}

interface WalletInfo {
  address: string;
  chain: string;
  publicKey?: string;
}

/**
 * Create or get an EVM smart wallet on base-sepolia chain
 * The wallet is owned by the specified email address
 */
export async function getOrCreateWallet(email: string): Promise<WalletInfo> {
  try {
    const response = await axios.post(
      `${CROSSMINT_API_URL}/wallets`,
      {
        chain: "base-sepolia",
        signer: {
          type: "email",
          email: email,
        },
      },
      {
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      address: response.data.address,
      chain: response.data.chain,
      publicKey: response.data.publicKey,
    };
  } catch (error) {
    console.error("[Crossmint] Error creating/getting wallet:", error);
    throw new Error("Failed to create or get wallet");
  }
}

/**
 * Get wallet balances including USDC
 * Note: This is a placeholder - actual implementation would use Crossmint SDK
 * For now, we'll use the API to check balances
 */
export async function getWalletBalance(walletAddress: string): Promise<WalletBalance> {
  try {
    // In a real implementation, this would call Crossmint's balance API
    // For now, we'll return a mock response structure
    const response = await axios.get(
      `${CROSSMINT_API_URL}/wallets/${walletAddress}/balances`,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
        params: {
          chain: "base-sepolia",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[Crossmint] Error getting wallet balance:", error);
    // Return default structure on error
    return {
      usdc: {
        balance: "0",
        decimals: 6,
        symbol: "USDC",
      },
    };
  }
}

/**
 * Transfer USDC tokens from agent wallet to recipient
 * @param toAddress Recipient wallet address
 * @param amount Amount in USDC (as string to preserve precision)
 * @returns Transaction hash and explorer link
 */
export async function transferUSDC(
  fromWalletAddress: string,
  toAddress: string,
  amount: string
): Promise<TransferResult> {
  try {
    const response = await axios.post(
      `${CROSSMINT_API_URL}/wallets/${fromWalletAddress}/transactions`,
      {
        chain: "base-sepolia",
        transaction: {
          to: toAddress,
          value: "0", // Native token value (0 for token transfers)
          data: "", // Contract call data would go here for ERC20 transfer
        },
        // For USDC transfer, we need to specify the token
        token: "usdc",
        amount: amount,
      },
      {
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      hash: response.data.hash || response.data.transactionHash,
      explorerLink: response.data.explorerLink || `https://sepolia.basescan.org/tx/${response.data.hash}`,
    };
  } catch (error: any) {
    console.error("[Crossmint] Error transferring USDC:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to transfer USDC");
  }
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
