import Stripe from 'stripe';
import { ENV_VARS } from '../config/envVars';

const stripe = new Stripe(ENV_VARS.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export default stripe;
