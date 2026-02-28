import { currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

/**
 * Ensure the current Clerk user exists in the Supabase users table.
 * This handles the case where the Webhook hasn't fired yet (e.g. local dev).
 * Uses upsert so it's safe to call on every request.
 */
export async function ensureUser(clerkId: string): Promise<void> {
  const supabase = createServerClient();

  // Quick check: does the user already exist?
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('clerk_id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (selectError) {
    console.error('ensureUser: failed to check existing user:', selectError);
    throw new Error(`Failed to check user: ${selectError.message}`);
  }

  if (existing) return;

  // User doesn't exist, fetch details from Clerk and insert
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;

  const { error: upsertError } = await supabase.from('users').upsert(
    {
      clerk_id: clerkId,
      email,
      name,
      avatar_url: user?.imageUrl ?? null,
    },
    { onConflict: 'clerk_id' }
  );

  if (upsertError) {
    console.error('ensureUser: failed to upsert user:', upsertError);
    throw new Error(`Failed to create user: ${upsertError.message}`);
  }
}
