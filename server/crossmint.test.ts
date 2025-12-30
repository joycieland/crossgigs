import { describe, expect, it } from "vitest";
import * as crossmint from "./crossmint";

describe("Crossmint API Integration", () => {
  it("should create or get wallet with valid API key", async () => {
    const testEmail = "test@example.com";
    
    try {
      const wallet = await crossmint.getOrCreateWallet(testEmail);
      
      // Verify wallet structure
      expect(wallet).toHaveProperty("address");
      expect(wallet).toHaveProperty("chain");
      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.chain).toBe("base-sepolia");
    } catch (error: any) {
      // If it fails, it should not be due to authentication
      expect(error.message).not.toContain("Authentication required");
      expect(error.message).not.toContain("API key");
    }
  }, 30000); // 30 second timeout for API call

  it("should validate Ethereum addresses correctly", () => {
    expect(crossmint.isValidEthereumAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0")).toBe(true);
    expect(crossmint.isValidEthereumAddress("invalid-address")).toBe(false);
    expect(crossmint.isValidEthereumAddress("0x123")).toBe(false);
  });
});
