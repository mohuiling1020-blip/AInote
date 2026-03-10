import { WaffoPancake } from '@waffo/pancake-ts';

let client: WaffoPancake | null = null;

export function getPancakeClient(): WaffoPancake {
  if (client) return client;

  const merchantId = process.env.WAFFO_MERCHANT_ID;
  const privateKey = process.env.WAFFO_PRIVATE_KEY;

  if (!merchantId || !privateKey) {
    throw new Error(
      'Missing required environment variables: WAFFO_MERCHANT_ID and WAFFO_PRIVATE_KEY'
    );
  }

  client = new WaffoPancake({ merchantId, privateKey });
  return client;
}

export const PANCAKE_CONFIG = {
  storeId: process.env.WAFFO_STORE_ID ?? '',
  products: {
    proMonthly: process.env.WAFFO_PRODUCT_PRO_MONTHLY ?? '',
    proYearly: process.env.WAFFO_PRODUCT_PRO_YEARLY ?? '',
  },
} as const;
