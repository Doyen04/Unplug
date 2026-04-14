import { getServerSession } from '../../../lib/server/auth-session';

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = (session as any)?.user ?? {};

    return Response.json({
        name: user.name ?? '',
        email: user.email ?? '',
    });
}
