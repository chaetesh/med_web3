# X402 Payment Integration for MediChain

This document outlines how X402 Polygon payments are integrated into the MediChain application.

## Overview

X402 is an HTTP-native micropayments protocol that enables instant, automatic stablecoin payments directly over HTTP. In MediChain, we've integrated X402 payments for the Genetic Risk Assessment service, requiring users to pay a small fee in USDC before generating new assessments.

## MetaMask Integration

The payment flow uses MetaMask to handle user payments:

1. When a user clicks "Generate New Assessment," a payment modal appears
2. User connects their MetaMask wallet (if not already connected)
3. The application switches to the correct network (Polygon Amoy) if needed
4. User confirms the payment transaction in MetaMask
5. The payment is processed on the Polygon network via USDC smart contract
6. After payment confirmation, the risk assessment is generated

## Implementation Details

### Backend

1. **PaymentsModule**: Handles payment requirements and verification
2. **X402PaymentMiddleware**: Intercepts requests to paid endpoints and enforces payment
3. **Configuration**: Uses environment variables to set payment address and facilitator URL

### Frontend

1. **PaymentService**: Manages payment requirements, processing, and verification
2. **PaymentModal**: UI component for handling wallet connection and payment confirmation
3. **Integration with GeneticRiskAssessmentList**: Shows payment modal before generating new assessments

## How It Works

1. When a user clicks "Generate New Assessment," a payment modal appears
2. User connects their wallet (if not already connected)
3. User confirms the payment transaction
4. Backend verifies the payment through the X402 facilitator
5. If payment is valid, the risk assessment is generated and returned to the user

## Configuration

The following environment variables should be set in the backend:

```
# X402 Payment Configuration
PAYMENT_ADDRESS=0xYourPolygonAddress
FACILITATOR_URL=https://x402.polygon.technology
```

## Technical Flow

1. **Initial Request**: Frontend attempts to access a paid endpoint
2. **402 Response**: Backend returns a 402 Payment Required with payment details
3. **MetaMask Interaction**: Frontend opens MetaMask for user to sign and confirm the transaction
4. **Payment Processing**: MetaMask processes the USDC transfer on Polygon network
5. **Payment Verification**: X402 protocol verifies the payment via the facilitator
6. **Service Delivery**: Backend delivers the requested service after payment confirmation

## Testing

For testing, the Polygon Amoy testnet is used. You can get testnet USDC from Circle's Faucet.

## Future Enhancements

1. Implement proper wallet integration using ethers.js or web3.js
2. Add payment receipts and transaction history
3. Support for multiple payment options and currencies
4. Implement payment verification through the facilitator API
