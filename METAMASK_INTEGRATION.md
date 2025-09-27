# MetaMask Integration for X402 Payments

This document provides information on how MetaMask is integrated with the X402 payment protocol for MediChain.

## Overview

The X402 payment protocol works with MetaMask to provide a seamless payment experience for users. When a user needs to make a payment for a service (like generating a risk assessment), the following process occurs:

1. The frontend shows a payment modal
2. User connects their MetaMask wallet
3. User confirms the payment transaction in MetaMask
4. The payment is processed on the Polygon network
5. The service is delivered after payment confirmation

## Implementation Details

### MetaMask Connection

- The application detects if MetaMask is installed in the browser
- Users can connect their MetaMask wallet with one click
- Connected wallet address is displayed in the UI

### Network Configuration

- The application automatically prompts users to switch to Polygon Amoy Testnet if they're on a different network
- If the network doesn't exist in their MetaMask, the app offers to add it automatically

### Payment Flow

1. User clicks "Pay $0.05 USDC" button
2. MetaMask opens showing payment details
3. User confirms the transaction in MetaMask
4. Backend receives payment confirmation
5. Service is delivered to the user

## Requirements

- MetaMask extension installed in the browser
- Test USDC tokens on the Polygon Amoy Testnet
  - Users can get test tokens from [Circle's Faucet](https://faucet.circle.com/)
  - Select "Polygon PoS Amoy" from the network dropdown

## Technical Details

- USDC Contract Address on Polygon Amoy: `0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97`
- Polygon Amoy Network ID: `80001` (Hex: `0x13881`)
- X402 Facilitator URL: `https://x402.polygon.technology`

## Error Handling

The application handles various scenarios including:
- MetaMask not installed
- User rejecting connection request
- Insufficient funds
- Network switching errors
- Transaction failures

Each error is displayed to the user with clear instructions on how to resolve it.
