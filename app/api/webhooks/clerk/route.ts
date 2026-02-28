import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createServerClient } from '@/lib/supabase';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    );
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const body = await request.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses?.[0]?.email_address ?? null;
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        const { error } = await supabase
          .from('users')
          .upsert(
            {
              clerk_id: id,
              email,
              name,
              avatar_url: image_url ?? null,
            },
            { onConflict: 'clerk_id' }
          );

        if (error) {
          console.error('Failed to upsert user:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', id);

        if (error) {
          console.error('Failed to delete user:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
