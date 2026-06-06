'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/server/db';
import { getServerSession } from '@/lib/server/auth-session';
import { auth } from '@/lib/auth';

export async function deleteAccountAction() {
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect('/login');
    }

    const userId = session.user.id;

    try {
        // Delete app-level data first (FK children), then Better Auth's own tables.
        await db.deleteFrom('connected_accounts').where('user_id', '=', userId).execute();
        await db.deleteFrom('user_subscriptions').where('user_id', '=', userId).execute();
        await db.deleteFrom('user_settings').where('user_id', '=', userId).execute();

        // Better Auth tables (session → account → verification → user)
        await db.deleteFrom('session').where('userId', '=', userId).execute();
        await db.deleteFrom('account').where('userId', '=', userId).execute();
        await db.deleteFrom('verification').where('identifier', '=', userId).execute();
        await db.deleteFrom('user').where('id', '=', userId).execute();

    } catch (error) {
        console.error('Failed to delete account:', error);
        redirect('/login?error=delete_failed');
    }
    await auth.api.signOut({ headers: await headers() });
    redirect('/signup');
}