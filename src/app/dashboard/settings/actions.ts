'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/server/db';
import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';

export async function toggleNotificationAction(setting: string, value: boolean) {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const col = setting === 'new_subscriptions_alerts' ? 'new_subscriptions_alerts'
    : setting === 'monthly_summary' ? 'monthly_summary'
      : setting === 'price_increase_alert' ? 'price_increase_alert'
        : null;

  if (!col) return { success: false, error: 'Invalid setting' };

  try {
    await sql`
      INSERT INTO user_settings (user_id, new_subscriptions_alerts, monthly_summary, price_increase_alert)
      VALUES (${userId}, true, true, false)
      ON CONFLICT (user_id) DO UPDATE SET
        ${sql.id(col)} = ${value},
        updated_at = now()
    `.execute(db);

    return { success: true };
  } catch (error) {
    console.error('Error toggling setting:', error);
    return { success: false, error: 'Database update failed' };
  }
}

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

  redirect('/');
}
