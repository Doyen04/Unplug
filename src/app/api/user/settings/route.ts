import { getServerSession } from '@/lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '@/lib/server/db';

interface UserSettings {
    new_subscriptions_alerts: boolean;
    monthly_summary: boolean;
    price_increase_alert: boolean;
    onboarding_completed?: boolean;
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
            SELECT new_subscriptions_alerts, monthly_summary, price_increase_alert, onboarding_completed
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
            onboarding_completed: false,
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

        // Validate and coerce boolean fields
        if (body.new_subscriptions_alerts !== undefined && typeof body.new_subscriptions_alerts !== 'boolean') {
            return Response.json({ error: 'Invalid new_subscriptions_alerts value' }, { status: 400 });
        }

        if (body.monthly_summary !== undefined && typeof body.monthly_summary !== 'boolean') {
            return Response.json({ error: 'Invalid monthly_summary value' }, { status: 400 });
        }

        if (body.price_increase_alert !== undefined && typeof body.price_increase_alert !== 'boolean') {
            return Response.json({ error: 'Invalid price_increase_alert value' }, { status: 400 });
        }

        if (body.onboarding_completed !== undefined && typeof body.onboarding_completed !== 'boolean') {
            return Response.json({ error: 'Invalid onboarding_completed value' }, { status: 400 });
        }

        // Single parameterized upsert query via raw SQL with proper parameterization
        const setClauses: any[] = [sql`updated_at = now()`];

        if (body.new_subscriptions_alerts !== undefined) {
            setClauses.push(sql`new_subscriptions_alerts = ${body.new_subscriptions_alerts}`);
        }
        if (body.monthly_summary !== undefined) {
            setClauses.push(sql`monthly_summary = ${body.monthly_summary}`);
        }
        if (body.price_increase_alert !== undefined) {
            setClauses.push(sql`price_increase_alert = ${body.price_increase_alert}`);
        }
        if (body.onboarding_completed !== undefined) {
            setClauses.push(sql`onboarding_completed = ${body.onboarding_completed}`);
            console.log('Updating onboarding_completed:', setClauses);
        }

        await sql`
            INSERT INTO user_settings (user_id, created_at, updated_at)
            VALUES (${userId}, now(), now())
            ON CONFLICT (user_id) DO UPDATE SET ${sql.join(setClauses, sql`, `)}
        `.execute(db);

        // Fetch and return updated settings
        const result = await sql<UserSettings>`
            SELECT new_subscriptions_alerts, monthly_summary, price_increase_alert, onboarding_completed
            FROM user_settings 
            WHERE user_id = ${userId}
        `.execute(db);

        console.log(result, 'result in settings page', body,setClauses);
        
        if (result.rows.length > 0) {
            return Response.json(result.rows[0]);
        }

        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    } catch (error) {
        console.error('Failed to update user settings:', error);
        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

