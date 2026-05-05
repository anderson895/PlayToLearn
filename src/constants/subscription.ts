import type { SubscriptionPlan } from '@/types';

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'plus_monthly',
    name: 'Plus Monthly',
    priceCents: 19900,
    currency: 'PHP',
    interval: 'month',
    perks: [
      'Unlimited hearts',
      'No ads',
      'AI Tutor with voice',
      'Offline lessons',
    ],
  },
  {
    id: 'plus_yearly',
    name: 'Plus Yearly',
    priceCents: 159900,
    currency: 'PHP',
    interval: 'year',
    perks: [
      'Everything in Plus Monthly',
      'Save 33%',
      'Priority AI Tutor responses',
      'Personalized learning path',
    ],
  },
  {
    id: 'family_yearly',
    name: 'Family Yearly',
    priceCents: 249900,
    currency: 'PHP',
    interval: 'year',
    perks: [
      'Up to 6 accounts',
      'All Plus features',
      'Parental dashboard',
      'Kid-safe AI Tutor',
    ],
  },
];

export const formatPrice = (cents: number, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
