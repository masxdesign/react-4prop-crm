import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe (memoized by loadStripe)
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    if (!stripePublishableKey || stripePublishableKey === 'pk_test_YOUR_KEY_HERE' || stripePublishableKey === 'pk_live_YOUR_KEY_HERE') {
      console.warn('Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
      return null;
    }
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export default getStripe;
