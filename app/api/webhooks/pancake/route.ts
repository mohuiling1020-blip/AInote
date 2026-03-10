import { NextRequest } from 'next/server';
import { verifyWebhook, WebhookEventType } from '@waffo/pancake-ts';
import type { WebhookEvent } from '@waffo/pancake-ts';
import { createServerClient } from '@/lib/supabase';

interface PancakeEventData {
  orderId: string;
  buyerEmail: string;
  currency: string;
  amount: number;
  taxAmount: number;
  productName: string;
}

async function updateSubscriptionStatus(
  clerkUserId: string,
  status: 'active' | 'canceling' | 'canceled' | 'past_due',
  orderId: string,
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_order_id: orderId,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkUserId);

  if (error) {
    console.error(`Failed to update subscription for ${clerkUserId}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-waffo-signature');

  let event: WebhookEvent<PancakeEventData>;
  try {
    event = verifyWebhook<PancakeEventData>(body, signature);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 401 });
  }

  // Parse metadata to get clerkUserId
  const parsed = JSON.parse(body);
  const metadata: Record<string, string> = parsed?.data?.metadata ?? {};
  const clerkUserId = metadata.clerkUserId;

  if (!clerkUserId) {
    console.warn('Webhook missing clerkUserId in metadata:', event.id);
    return new Response('OK', { status: 200 });
  }

  try {
    switch (event.eventType) {
      case WebhookEventType.SubscriptionActivated:
        await updateSubscriptionStatus(clerkUserId, 'active', event.data.orderId);
        console.log(`Subscription activated for ${clerkUserId}`);
        break;

      case WebhookEventType.SubscriptionPaymentSucceeded:
        await updateSubscriptionStatus(clerkUserId, 'active', event.data.orderId);
        console.log(`Subscription payment succeeded for ${clerkUserId}`);
        break;

      case WebhookEventType.SubscriptionCanceling:
        await updateSubscriptionStatus(clerkUserId, 'canceling', event.data.orderId);
        console.log(`Subscription canceling for ${clerkUserId}`);
        break;

      case WebhookEventType.SubscriptionCanceled:
        await updateSubscriptionStatus(clerkUserId, 'canceled', event.data.orderId);
        console.log(`Subscription canceled for ${clerkUserId}`);
        break;

      case WebhookEventType.SubscriptionPastDue:
        await updateSubscriptionStatus(clerkUserId, 'past_due', event.data.orderId);
        console.log(`Subscription past due for ${clerkUserId}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.eventType}`);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
