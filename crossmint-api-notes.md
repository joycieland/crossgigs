# Crossmint API Documentation

## Create Wallet Endpoint

**URL:** `POST https://www.crossmint.com/api/2025-06-09/wallets`

**Headers:**
- `X-API-KEY`: API key required for authentication
- `Content-Type`: application/json
- `x-idempotency-key` (optional): Unique key to prevent duplicate wallet creation

**Request Body for EVM Smart Wallet:**
```json
{
  "chainType": "evm",
  "type": "smart",
  "config": {
    "adminSigner": {
      "type": "api-key",
      "address": "0x1234567890123456789012345678901234567890"
    }
  },
  "owner": "email:user@example.com"
}
```

**Response (201):**
```json
{
  "chainType": "evm",
  "type": "smart",
  "owner": "email:user@example.com",
  "address": "0x1234567890123456789012345678901234567890",
  "config": {
    "adminSigner": {
      "type": "external-wallet",
      "address": "0x1234567890123456789012345678901234567890",
      "locator": "external-wallet:0x1234567890123456789012345678901234567890"
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "alias": "my-usdc-wallet"
}
```

## Key Changes Needed:
1. Update API URL to include version path: `/2025-06-09/wallets`
2. Change request body structure to use `chainType` instead of `chain`
3. Add `type: "smart"` field
4. Format owner as `email:user@example.com` instead of nested object
5. Add `config` with `adminSigner` for smart wallets
