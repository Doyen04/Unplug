'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/server/db';
import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';


export async function deleteAccountAction() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  try {
    // Delete app-level data first (FK children), then Better Auth's own tables.
    // We delete directly from the DB — auth.api.deleteUser() requires forwarded
    // HTTP request headers that Next.js server actions cannot provide reliably.
    await sql`DELETE FROM connected_accounts  WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_subscriptions  WHERE user_id = ${userId}`.execute(db);
    await sql`DELETE FROM user_settings       WHERE user_id = ${userId}`.execute(db);

    // Better Auth tables (session → account → verification → user)
    await sql`DELETE FROM session      WHERE "userId" = ${userId}`.execute(db);
    await sql`DELETE FROM account      WHERE "userId" = ${userId}`.execute(db);
    await sql`DELETE FROM verification WHERE identifier = ${userId}`.execute(db);
    await sql`DELETE FROM "user"       WHERE id        = ${userId}`.execute(db);

  } catch (error) {
    console.error('Failed to delete account:', error);
    redirect('/login?error=delete_failed');
  }

  redirect('/signup');
}
