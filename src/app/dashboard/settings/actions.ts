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
    // 1. Wipe custom state tables
    await sql`DELETE FROM connected_accounts WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_subscriptions WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_settings WHERE user_id = ${userId}`.execute(db);

    // 2. Wipe identity & sessions through Better-Auth
    // Better-Auth does not export a direct internal db delete method for user, we use the API client
    await auth.api.deleteUser({
      body: {},
      headers: await headers() as any
    });

  } catch (error) {
    console.error('Failed to wipe user data:', error);
    // Even if something fails, the user requested deletion, but we should probably redirect with an error status.
    redirect('/dashboard/settings?error=delete_failed');
  }

  redirect('/signup');
}
