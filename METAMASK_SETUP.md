# Adding Polygon Amoy Testnet to MetaMask

If you're experiencing issues with the automatic network configuration, follow these steps to manually add the Polygon Amoy Testnet to your MetaMask wallet:

## Manual Configuration Steps

1. Open your MetaMask extension
2. Click on the network dropdown at the top (usually shows "Ethereum Mainnet")
3. Click "Add Network" 
4. Select "Add a network manually" at the bottom

## Network Details

Use these settings:

- **Network Name**: Polygon Amoy Testnet
- **New RPC URL**: https://polygon-amoy.g.alchemy.com/v2/demo
- **Chain ID**: 80002 (or 0x13882 in hex)
- **Currency Symbol**: MATIC
- **Block Explorer URL**: https://www.oklink.com/amoy

## Alternative RPC URLs

If the primary RPC URL doesn't work, try one of these alternatives:
- https://rpc-amoy.polygon.technology
- https://rpc.ankr.com/polygon_amoy

## Getting Test Tokens

Once connected to Polygon Amoy Testnet:

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Amoy" from the network dropdown
3. Enter your wallet address
4. Request both MATIC and POL test tokens

## Troubleshooting

### Common Issues

- **MetaMask not responding**: Reload the page and try again
- **Network switch failing**: Close other browser tabs that might be using MetaMask
- **Transaction errors**: Make sure you have enough MATIC for gas fees (at least 0.01 MATIC)

### Internal JSON-RPC Error (-32603)

If you encounter this error when making payments:

1. **Check your balance** - Make sure you have enough POL tokens for the payment AND enough MATIC for gas
2. **Try a smaller amount** - Try sending 0.01 POL instead of 0.05 to test
3. **Gas settings** - The application now includes optimized gas settings to help transactions succeed
4. **Network congestion** - Try again later if the Polygon Amoy network is congested
5. **RPC endpoint issues** - Try using a different RPC URL from the alternatives listed above

### Checking Transaction Status

If your transaction was sent but you didn't receive confirmation:
1. Get your transaction hash from the payment modal
2. Check it on the [Amoy Block Explorer](https://www.oklink.com/amoy)
3. If confirmed on the explorer but not in the app, refresh the page
