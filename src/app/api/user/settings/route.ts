import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '@/lib/server/db';

interface UserSettings {
    new_subscriptions_alerts: boolean;
    monthly_summary: boolean;
    price_increase_alert: boolean;
}

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as any)?.user?.id;
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await sql<UserSettings>`
            SELECT new_subscriptions_alerts, monthly_summary, price_increase_alert 
            FROM user_settings 
            WHERE user_id = ${userId}
        `.execute(db);

        if (result.rows.length > 0) {
            return Response.json(result.rows[0]);
        }

        // Return defaults if no settings exist
        const defaults: UserSettings = {
            new_subscriptions_alerts: true,
            monthly_summary: true,
            price_increase_alert: false,
        };

        return Response.json(defaults);
    } catch (error) {
        console.error('Failed to fetch user settings:', error);
        return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession();

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as any)?.user?.id;
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json() as Partial<UserSettings>;

        // Validate and update each setting if provided
        if (body.new_subscriptions_alerts !== undefined) {
            await sql`
                UPDATE user_settings 
                SET new_subscriptions_alerts = ${body.new_subscriptions_alerts}
                WHERE user_id = ${userId}
            `.execute(db);
        }

        if (body.monthly_summary !== undefined) {
            await sql`
                UPDATE user_settings 
                SET monthly_summary = ${body.monthly_summary}
                WHERE user_id = ${userId}
            `.execute(db);
        }

        if (body.price_increase_alert !== undefined) {
            await sql`
                UPDATE user_settings 
                SET price_increase_alert = ${body.price_increase_alert}
                WHERE user_id = ${userId}
            `.execute(db);
        }

        // Fetch and return updated settings
        const result = await sql<UserSettings>`
            SELECT new_subscriptions_alerts, monthly_summary, price_increase_alert 
            FROM user_settings 
            WHERE user_id = ${userId}
        `.execute(db);

        if (result.rows.length > 0) {
            return Response.json(result.rows[0]);
        }

        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    } catch (error) {
        console.error('Failed to update user settings:', error);
        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
