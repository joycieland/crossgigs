# Crossmint Transfer Token API Response Structure

Based on the official API documentation, the response contains:

```json
{
  "chainType": "evm",
  "walletType": "smart",
  "params": { ... },
  "onChain": {
    "userOperation": { ... },
    "userOperationHash": "<string>",
    "txId": "<string>",  // This is the actual blockchain transaction hash
    "explorerLink": "<string>"
  },
  "id": "<string>",
  "status": "awaiting-approval" | "pending" | "failed" | "success",
  ...
}
```

## Key Fields for Transaction Hash:

- `onChain.txId` - The actual blockchain transaction hash (this is what we want!)
- `onChain.userOperationHash` - The user operation hash (NOT the same as txId)
- `onChain.explorerLink` - Direct link to block explorer

## Current Issue:

We are currently extracting in this order:
1. `response.data.onChain?.transactionHash` (doesn't exist)
2. `response.data.onChain?.txId` (correct field!)
3. `response.data.onChain?.userOperationHash` (wrong - this is not the blockchain tx hash)

The problem is likely that `txId` might not be immediately available in the response, and we're falling back to `userOperationHash` which is incorrect.
