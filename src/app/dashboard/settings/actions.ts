'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/server/db';
import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';


export async function deleteAccountAction() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  try {
    // 1. Delete the Better-Auth user record first (this also invalidates all sessions)
    await auth.api.deleteUser({
      body: {},
      headers: await headers() as any
    });

    // 2. Wipe custom state tables after auth identity is gone
    await sql`DELETE FROM connected_accounts WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_subscriptions WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_settings WHERE user_id = ${userId}`.execute(db);

  } catch (error) {
    console.error('Failed to wipe user data:', error);
    // Redirect to /login with error — avoids the dashboard layout's onboarding guard
    // which would redirect to /onboarding if user_settings was already partially wiped.
    redirect('/login?error=delete_failed');
  }

  redirect('/signup');
}

