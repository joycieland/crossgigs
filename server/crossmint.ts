import axios from "axios";

const API_KEY = process.env.API_KEY;
// Automatically use staging or production API based on the API key prefix
const isStaging = API_KEY?.startsWith("sk_staging_");
const CROSSMINT_API_URL = isStaging 
  ? "https://staging.crossmint.com/api/2025-06-09"
  : "https://www.crossmint.com/api/2025-06-09";

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
    // First, try to get existing wallet
    const walletLocator = `email:${email}:evm`;
    try {
      const getResponse = await axios.get(
        `${CROSSMINT_API_URL}/wallets/${encodeURIComponent(walletLocator)}`,
        {
          headers: {
            "X-API-KEY": API_KEY,
          },
        }
      );
      
      if (getResponse.data && getResponse.data.address) {
        return {
          address: getResponse.data.address,
          chain: "base-sepolia",
          publicKey: getResponse.data.publicKey,
        };
      }
    } catch (getError: any) {
      // Wallet doesn't exist, proceed to create it
      if (getError.response?.status !== 404) {
        console.warn("[Crossmint] Error checking existing wallet:", getError.response?.data || getError.message);
      }
    }

    // Create new wallet if it doesn't exist
    const response = await axios.post(
      `${CROSSMINT_API_URL}/wallets`,
      {
        chainType: "evm",
        type: "smart",
        config: {
          adminSigner: {
            type: "api-key",
          },
        },
        owner: `email:${email}`,
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
      chain: "base-sepolia",
      publicKey: response.data.publicKey,
    };
  } catch (error: any) {
    console.error("[Crossmint] Error creating/getting wallet:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create or get wallet");
  }
}

/**
 * Get wallet balances including USDC
 * Note: This is a placeholder - actual implementation would use Crossmint SDK
 * For now, we'll use the API to check balances
 */
export async function getWalletBalance(email: string): Promise<WalletBalance> {
  try {
    // Use wallet locator format: email:<email>:evm
    const walletLocator = `email:${email}:evm`;
    const response = await axios.get(
      `${CROSSMINT_API_URL}/wallets/${encodeURIComponent(walletLocator)}/balances`,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
        params: {
          tokens: "usdc,eth",
          chains: "base-sepolia",
        },
      }
    );

    // Parse the response to extract USDC balance
    const tokens = response.data as Array<{
      symbol: string;
      decimals: number;
      amount: string;
      rawAmount: string;
      chains: Record<string, any>;
    }>;

    const usdcToken = tokens.find(t => t.symbol.toUpperCase() === "USDC");
    const ethToken = tokens.find(t => t.symbol.toUpperCase() === "ETH");

    return {
      usdc: usdcToken ? {
        balance: usdcToken.amount,
        decimals: usdcToken.decimals,
        symbol: usdcToken.symbol,
      } : {
        balance: "0",
        decimals: 6,
        symbol: "USDC",
      },
      nativeToken: ethToken ? {
        balance: ethToken.amount,
        decimals: ethToken.decimals,
        symbol: ethToken.symbol,
      } : undefined,
    };
  } catch (error: any) {
    console.error("[Crossmint] Error getting wallet balance:", error.response?.data || error.message);
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
  fromEmail: string,
  toAddress: string,
  amount: string
): Promise<TransferResult> {
  try {
    // Use wallet locator format: email:<email>:evm
    const walletLocator = `email:${fromEmail}:evm`;
    // Token locator for USDC on base-sepolia
    const tokenLocator = "base-sepolia:usdc";
    
    const response = await axios.post(
      `${CROSSMINT_API_URL}/wallets/${encodeURIComponent(walletLocator)}/tokens/${tokenLocator}/transfers`,
      {
        recipient: toAddress,
        amount: amount,
      },
      {
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // The response contains transaction details
    console.log("[Crossmint] Transfer response:", JSON.stringify(response.data, null, 2));
    
    const transferId = response.data.id;
    const transferWalletLocator = `email:${fromEmail}:evm`;
    
    // Poll for the actual transaction hash (txId)
    // The initial response may only have userOperationHash, but txId appears after confirmation
    let txHash = response.data.onChain?.txId;
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 30 seconds
    
    while (!txHash && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
      
      try {
        // Fetch the transfer status to get the updated txId
        const statusResponse = await axios.get(
          `${CROSSMINT_API_URL}/wallets/${encodeURIComponent(transferWalletLocator)}/transfers/${transferId}`,
          {
            headers: {
              "X-API-KEY": API_KEY,
            },
          }
        );
        
        txHash = statusResponse.data.onChain?.txId;
        console.log(`[Crossmint] Poll attempt ${attempts}: txId =`, txHash);
        
        if (txHash) {
          break;
        }
      } catch (pollError: any) {
        console.warn(`[Crossmint] Error polling transfer status:`, pollError.response?.data || pollError.message);
      }
    }
    
    // Fallback to userOperationHash if txId never appears (shouldn't happen in normal cases)
    if (!txHash) {
      console.warn("[Crossmint] Could not get txId after polling, using userOperationHash as fallback");
      txHash = response.data.onChain?.userOperationHash;
    }
    
    const explorerLink = response.data.onChain?.explorerLink || `https://sepolia.basescan.org/tx/${txHash}`;

    console.log("[Crossmint] Final txHash:", txHash);
    console.log("[Crossmint] Explorer link:", explorerLink);

    return {
      hash: txHash || "pending",
      explorerLink: explorerLink,
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
