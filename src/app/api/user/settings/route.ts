import { getServerSession } from '@/lib/server/auth-session';
import { db } from '@/lib/server/db';
import { ensureUserBootstrap } from '@/lib/server/user-bootstrap';

type UserSettingsUpdate = {
    onboarding_completed?: boolean;
    new_subscriptions_alerts?: boolean;
    monthly_summary?: boolean;
    price_increase_alert?: boolean;
};

const BOOLEAN_FIELDS: (keyof UserSettingsUpdate)[] = [
    'onboarding_completed',
    'new_subscriptions_alerts',
    'monthly_summary',
    'price_increase_alert',
];

export async function GET() {
    const session = await getServerSession();
    const userId = (session as any)?.user?.id as string | undefined;

    if (!session || !userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await ensureUserBootstrap(userId);
        const settings = await getUserSettings(userId);

        return Response.json(
            settings ?? {
                new_subscriptions_alerts: true,
                monthly_summary: true,
                price_increase_alert: false,
                onboarding_completed: false,
            }
        );
    } catch (error) {
        console.error('Failed to fetch user settings:', error);
        return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

async function upsertUserSettings(userId: string, data: UserSettingsUpdate) {
    const updates: Record<string, unknown> = {};

    if (data.onboarding_completed !== undefined)
        updates.onboarding_completed = data.onboarding_completed;
    if (data.new_subscriptions_alerts !== undefined)
        updates.new_subscriptions_alerts = data.new_subscriptions_alerts;
    if (data.monthly_summary !== undefined)
        updates.monthly_summary = data.monthly_summary;
    if (data.price_increase_alert !== undefined)
        updates.price_increase_alert = data.price_increase_alert;

    const now = new Date();
    await db
        .insertInto('user_settings')
        .values({
            user_id: userId,
            ...updates,
            created_at: now,
            updated_at: now,
        })
        .onConflict((oc) =>
            oc.column('user_id').doUpdateSet({
                updated_at: now,
                ...updates,
            } as any)
        )
        .execute();
}

async function getUserSettings(userId: string) {
    return db
        .selectFrom('user_settings')
        .select([
            'new_subscriptions_alerts',
            'monthly_summary',
            'price_increase_alert',
            'onboarding_completed',
        ] as const)
        .where('user_id', '=', userId)
        .executeTakeFirst();
}

export async function PATCH(req: Request) {
    const session = await getServerSession();
    const userId = (session as any)?.user?.id as string | undefined;

    if (!session || !userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await ensureUserBootstrap(userId);
        const body = (await req.json()) as Partial<UserSettingsUpdate>;

        for (const field of BOOLEAN_FIELDS) {
            if (body[field] !== undefined && typeof body[field] !== 'boolean') {
                return Response.json({ error: `Invalid ${field} value` }, { status: 400 });
            }
        }

        await upsertUserSettings(userId, body);

        const settings = await getUserSettings(userId);
        if (!settings) {
            return Response.json({ error: 'Failed to update settings' }, { status: 500 });
        }

        return Response.json(settings);
    } catch (error) {
        console.error('Failed to update user settings:', error);
        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}