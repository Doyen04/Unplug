import { getServerSession } from '@/lib/server/auth-session';
import { ensureUserBootstrap } from '@/lib/server/user-bootstrap';

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as any)?.user?.id as string | undefined;
    if (userId) {
        await ensureUserBootstrap(userId);
    }

    const user = (session as any)?.user ?? {};

    return Response.json({
        name: user.name ?? '',
        email: user.email ?? '',
    });
}
