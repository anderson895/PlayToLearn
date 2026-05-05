/**
 * PayMongo client (https://developers.paymongo.com).
 *
 * Demo mode (default): if EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY or EXPO_PUBLIC_API_URL
 * is missing, every call returns a fake success after a short delay so you can
 * demo the UI without a PayMongo account.
 *
 * Production mode: when both env vars are set, the client tokenizes cards
 * client-side with the public key and asks your backend to create the
 * subscription using the secret key. The secret key MUST live on the backend.
 */
import type { SubscriptionPlan } from '@/types';

const PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY ?? '';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const isDemoMode = !PUBLIC_KEY || !API_URL;

const basicAuth = (key: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'Basic ' + (globalThis as any).btoa(`${key}:`);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: number;
  cardHolderName: string;
}

export async function createPaymentMethodCard(card: CardDetails): Promise<string> {
  if (isDemoMode) {
    await sleep(700);
    return `pm_demo_${Date.now()}`;
  }
  const res = await fetch('https://api.paymongo.com/v1/payment_methods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(PUBLIC_KEY),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: 'card',
          details: {
            card_number: card.cardNumber.replace(/\s+/g, ''),
            exp_month: card.expMonth,
            exp_year: card.expYear,
            cvc: String(card.cvc),
          },
          billing: { name: card.cardHolderName },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`PayMongo error ${res.status}`);
  const json = await res.json();
  return json.data.id as string;
}

/**
 * Ask our backend to create a subscription using the tokenized payment method.
 * The backend must:
 *   1. Create or fetch a PayMongo customer for the user
 *   2. Attach the payment method
 *   3. Create the subscription on the chosen plan
 *   4. Return a 3DS / OTP redirect URL if required
 */
export async function createSubscription(args: {
  authToken: string;
  plan: SubscriptionPlan;
  paymentMethodId?: string;
  source: 'card' | 'gcash';
}): Promise<{ status: 'active' | 'pending'; redirectUrl?: string }> {
  if (isDemoMode) {
    await sleep(900);
    return { status: 'active' };
  }
  const res = await fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify({
      planId: args.plan.id,
      paymentMethodId: args.paymentMethodId,
      source: args.source,
    }),
  });
  if (!res.ok) throw new Error('Subscription failed');
  return res.json();
}

/**
 * GCash uses PayMongo "Sources". In production, our backend creates a source
 * and returns the checkout URL we open in a WebView. In demo mode we skip the
 * WebView and immediately mark the user as subscribed.
 */
export async function createGCashSource(args: {
  authToken: string;
  plan: SubscriptionPlan;
}): Promise<{ checkoutUrl: string | null; sourceId: string }> {
  if (isDemoMode) {
    await sleep(700);
    return { checkoutUrl: null, sourceId: 'src_demo_local' };
  }
  const res = await fetch(`${API_URL}/payments/gcash`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify({ planId: args.plan.id }),
  });
  if (!res.ok) throw new Error('GCash source failed');
  return res.json();
}
