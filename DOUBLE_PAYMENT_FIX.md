# Double Payment Request Fix

## Issue Description
After a successful payment transaction, users were getting a second MetaMask payment request. This happened because the payment modal wasn't properly closing and resetting after the successful payment.

## Root Cause Analysis
1. In `PaymentModal.tsx`, after a successful transaction:
   - The component called `onPaymentComplete` and set a timeout to close the modal
   - However, the modal states (like `paymentSuccess` and `transactionHash`) weren't being reset
   
2. In `GeneticRiskAssessmentList.tsx`:
   - The `handlePaymentComplete` function was not explicitly closing the payment modal
   - This meant the modal was waiting for the timeout (3 seconds) before closing

## Fixes Applied

### In PaymentModal.tsx
- Added proper state reset before closing the modal:
```javascript
setTimeout(() => {
  // Reset states before closing
  setPaymentSuccess(false);
  setTransactionHash('');
  setProcessing(false);
  onClose();
}, 3000);
```

### In GeneticRiskAssessmentList.tsx
1. Improved the `handleGenerateClick` function to reset more states:
```javascript
const handleGenerateClick = () => {
  // Show payment modal when user clicks the generate button
  setShowPaymentModal(true);
  // Clear previous messages and states
  setSuccessMessage(null);
  setTransactionHash(null);
  setGenerating(false);
};
```

2. Updated the `handlePaymentComplete` function to close the modal immediately on successful payment:
```javascript
// This handler will receive the transaction hash from the payment modal
const handlePaymentComplete = async (txHash?: string) => {
  // Store the transaction hash if provided
  if (txHash) {
    setTransactionHash(txHash);
    
    // Close the payment modal immediately on successful payment
    setShowPaymentModal(false);
  }
  
  // Rest of the function...
};
```

## Benefits of the Fix
- The payment modal now closes immediately when the payment succeeds (as soon as `handlePaymentComplete` is called)
- All relevant state is properly reset between payment attempts
- Users won't see a second MetaMask prompt after a successful payment
- Payment flow feels more responsive since the modal closes right away after success

## Additional Notes
- The success message still appears in the parent component for 10 seconds
- The transaction hash is still displayed in the parent component
- If you need to adjust the timing of these interactions, you can modify the timeouts in both components
