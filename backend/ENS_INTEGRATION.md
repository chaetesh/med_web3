# ENS Integration in Authentication

This document explains how ENS (Ethereum Name Service) names are integrated into the authentication endpoints with support for both Ethereum Mainnet and Sepolia testnet.

## Features Added

1. **Multi-Network ENS Resolution**: Support for both Ethereum Mainnet and Sepolia testnet
2. **ENS Name Resolution**: Convert ENS names (like `vitalik.eth`) to Ethereum addresses
3. **Reverse ENS Resolution**: Convert Ethereum addresses back to ENS names
4. **ENS Metadata**: Retrieve additional information like avatar, description, social links
5. **Network Detection**: Automatically determine which network resolved the ENS name
6. **Fallback Strategy**: Try mainnet first, then Sepolia if mainnet fails
7. **Seamless Integration**: Use ENS names anywhere wallet addresses are accepted

## Authentication Endpoints Enhanced

### 1. Wallet Login - `/api/auth/wallet/login`

**Before**: Only accepted wallet addresses
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
  "signature": "0x...",
  "message": "Login message"
}
```

**Now**: Accepts both wallet addresses and ENS names
```json
{
  "address": "vitalik.eth",
  "signature": "0x...",
  "message": "Login message"
}
```

**Enhanced Response** includes ENS information with network detection:
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "Vitalik",
    "lastName": "Buterin",
    "role": "patient",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
    "wallet": {
      "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
      "ensName": "vitalik.eth",
      "displayName": "vitalik.eth",
      "network": "mainnet",
      "metadata": {
        "avatar": "https://...",
        "description": "Ethereum co-founder",
        "url": "https://vitalik.ca",
        "social": {
          "twitter": "VitalikButerin",
          "github": "vbuterin"
        }
      }
    }
  },
  "access_token": "eyJ..."
}
```

### 2. Wallet Registration - `/api/auth/wallet/register`

**Before**: Only accepted wallet addresses
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "patient"
}
```

**Now**: Accepts ENS names
```json
{
  "address": "johndoe.eth",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "role": "patient"
}
```

### 3. Link Wallet - `/api/auth/wallet/link`

**Before**: Only accepted wallet addresses
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B"
}
```

**Now**: Accepts ENS names
```json
{
  "walletAddress": "johndoe.eth"
}
```

## New ENS-Specific Endpoints

### 1. Resolve ENS - `/api/auth/ens/resolve` (GET)

Resolve ENS name to address (with optional network parameter):
```
GET /api/auth/ens/resolve?name=vitalik.eth&network=mainnet
```

Response:
```json
{
  "ensName": "vitalik.eth",
  "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
  "resolved": true,
  "network": "mainnet",
  "metadata": {
    "name": "vitalik.eth",
    "avatar": "https://...",
    "description": "Ethereum co-founder",
    "url": "https://vitalik.ca",
    "twitter": "VitalikButerin",
    "github": "vbuterin",
    "network": "mainnet"
  }
}
```

Reverse resolve address to ENS (supports both networks):
```
GET /api/auth/ens/resolve?address=0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B
```

Response:
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
  "ensName": "vitalik.eth",
  "resolved": true,
  "displayName": "vitalik.eth",
  "network": "mainnet",
  "metadata": {
    "name": "vitalik.eth",
    "avatar": "https://...",
    "description": "Ethereum co-founder",
    "url": "https://vitalik.ca",
    "twitter": "VitalikButerin",
    "github": "vbuterin",
    "network": "mainnet"
  }
}
```

For Sepolia testnet resolution:
```
GET /api/auth/ens/resolve?name=test.eth&network=sepolia
```

Response:
```json
{
  "ensName": "test.eth",
  "address": "0x1234567890123456789012345678901234567890",
  "resolved": true,
  "network": "sepolia",
  "metadata": {
    "name": "test.eth",
    "avatar": null,
    "description": "Test ENS on Sepolia",
    "url": null,
    "twitter": null,
    "github": null,
    "network": "sepolia"
  }
}
```

### 2. Get User's Wallet ENS - `/api/auth/wallet/ens` (GET, Protected)

Get ENS information for the authenticated user's wallet:

Response for user with ENS:
```json
{
  "hasWallet": true,
  "wallet": {
    "address": "0x742d35Cc6634C0532925a3b8D3fE02C5FBfDB97B",
    "ensName": "vitalik.eth",
    "displayName": "vitalik.eth",
    "network": "mainnet",
    "metadata": {
      "avatar": "https://...",
      "description": "Ethereum co-founder",
      "url": "https://vitalik.ca",
      "social": {
        "twitter": "VitalikButerin",
        "github": "vbuterin"
      }
    }
  }
}
```

Response for user without ENS:
```json
{
  "hasWallet": true,
  "wallet": {
    "address": "0x1234567890123456789012345678901234567890",
    "ensName": null,
    "displayName": "0x1234...7890",
    "network": null,
    "metadata": null
  }
}
```

Response for user without wallet:
```json
{
  "hasWallet": false,
  "message": "No wallet linked to this account"
}
```

### 3. Network Status - `/api/auth/ens/network-status` (GET)

Get current network status and connectivity:

Response:
```json
{
  "currentNetwork": "mainnet",
  "connectivity": {
    "mainnet": {
      "connected": true,
      "blockNumber": 18500000
    },
    "sepolia": {
      "connected": true,
      "blockNumber": 4800000
    }
  },
  "supportedNetworks": ["mainnet", "sepolia"],
  "ensSupport": {
    "mainnet": "Full ENS support",
    "sepolia": "Testnet ENS support"
  }
}
```

## Configuration

Add these environment variables to your `.env` file for multi-network support:

```env
# Current network (mainnet or sepolia)
ETHEREUM_NETWORK=mainnet

# Mainnet RPC URLs (choose one)
ETHEREUM_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# OR use these individual API keys
ALCHEMY_API_KEY=your_alchemy_api_key
INFURA_API_KEY=your_infura_api_key

# Sepolia RPC URLs (choose one)
ETHEREUM_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# Uses same API keys as above for Sepolia

# Fallback: Public RPCs are used if no API keys provided
# Mainnet: https://cloudflare-eth.com
# Sepolia: https://rpc.sepolia.org
```

### Environment Variable Priority:

1. **Specific RPC URLs**: `ETHEREUM_MAINNET_RPC_URL` / `ETHEREUM_SEPOLIA_RPC_URL`
2. **Alchemy**: Uses `ALCHEMY_API_KEY` for both networks
3. **Infura**: Uses `INFURA_API_KEY` for both networks  
4. **Public RPCs**: Fallback option (may have rate limits)

## Error Handling

- **Invalid ENS format**: Returns validation error
- **ENS resolution fails**: Tries both networks, falls back gracefully
- **Network connectivity issues**: Automatically switches between networks
- **Rate limiting**: Handles gracefully with retries and fallback providers
- **Sepolia-specific errors**: Clear indication of testnet limitations

## Network Resolution Strategy

1. **Primary**: Attempts resolution on Ethereum mainnet first
2. **Fallback**: If mainnet fails or user specifies sepolia, tries Sepolia testnet
3. **Metadata**: Attempts to get ENS metadata from the network that successfully resolved the name
4. **Logging**: Clear logs indicating which network resolved each ENS name

## Implementation Notes

1. **Multi-Network Performance**: ENS resolution attempts mainnet first, then Sepolia
2. **Network Detection**: Automatically detects which network resolved the ENS name
3. **Sepolia Support**: Full support for Sepolia testnet ENS names
4. **Fallback Strategy**: Graceful fallback between networks and providers
5. **Backwards Compatible**: Existing wallet integrations continue to work
6. **Configuration Flexibility**: Support for multiple RPC providers
7. **Development-Friendly**: Easy testing on Sepolia testnet

## Usage Examples

### Frontend Integration

```javascript
// Login with ENS name (works on both mainnet and sepolia)
const loginWithENS = async (ensName, signature, message) => {
  const response = await fetch('/api/auth/wallet/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: ensName, // Can be ENS name or wallet address
      signature,
      message
    })
  });
  
  const result = await response.json();
  console.log('User wallet info:', result.user.wallet);
  console.log('Resolved on network:', result.user.wallet.network);
};

// Resolve ENS with network preference
const resolveENS = async (ensName, network = null) => {
  const url = network 
    ? `/api/auth/ens/resolve?name=${ensName}&network=${network}`
    : `/api/auth/ens/resolve?name=${ensName}`;
    
  const response = await fetch(url);
  const result = await response.json();
  return result.resolved ? result.address : null;
};

// Check network connectivity status
const checkNetworkStatus = async () => {
  const response = await fetch('/api/auth/ens/network-status');
  const status = await response.json();
  
  console.log('Current network:', status.currentNetwork);
  console.log('Mainnet connected:', status.connectivity.mainnet.connected);
  console.log('Sepolia connected:', status.connectivity.sepolia.connected);
  
  return status;
};

// Testnet-specific operations
const resolveOnSepolia = async (ensName) => {
  const response = await fetch(`/api/auth/ens/resolve?name=${ensName}&network=sepolia`);
  const result = await response.json();
  
  if (result.resolved && result.network === 'sepolia') {
    console.log('Resolved on Sepolia testnet:', result.address);
    return result.address;
  }
  
  return null;
};
```

This multi-network ENS integration makes the authentication system work seamlessly across both Ethereum mainnet and Sepolia testnet, providing flexibility for development, testing, and production environments while maintaining full backwards compatibility.