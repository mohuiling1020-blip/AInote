import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getPancakeClient, PANCAKE_CONFIG } from '@/lib/pancake';
import { WaffoPancakeError } from '@waffo/pancake-ts';

interface CheckoutRequestBody {
  plan: 'pro';
  period: 'monthly' | 'yearly';
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { plan, period } = body;
  if (plan !== 'pro' || !['monthly', 'yearly'].includes(period)) {
    return NextResponse.json({ error: 'Invalid plan or period' }, { status: 400 });
  }

  const productId = period === 'monthly'
    ? PANCAKE_CONFIG.products.proMonthly
    : PANCAKE_CONFIG.products.proYearly;

  if (!productId || !PANCAKE_CONFIG.storeId) {
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 500 }
    );
  }

  try {
    const user = await currentUser();
    const buyerEmail = user?.emailAddresses?.[0]?.emailAddress;

    const client = getPancakeClient();
    const session = await client.checkout.createSession({
      storeId: PANCAKE_CONFIG.storeId,
      productId,
      productType: 'subscription',
      currency: 'USD',
      ...(buyerEmail ? { buyerEmail } : {}),
      successUrl: `${request.nextUrl.origin}/app?checkout=success`,
      metadata: {
        clerkUserId: userId,
        plan,
        period,
      },
    });

    return NextResponse.json({ checkoutUrl: session.checkoutUrl });
  } catch (err) {
    if (err instanceof WaffoPancakeError) {
      console.error('Pancake checkout error:', err.status, err.errors);
      return NextResponse.json(
        { error: 'Payment service error' },
        { status: 502 }
      );
    }
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
