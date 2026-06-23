import { NextResponse } from 'next/server';
import { getCancellationInstructions } from '@/lib/server/gemini';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('serviceName');

    if (!serviceName) {
        return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    try {
        const result = await getCancellationInstructions(serviceName);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching cancel instructions:', error);
        
        if (error.message && error.message.includes('API_KEY')) {
            return NextResponse.json({ error: `Gemini API key is not configured /n Error: ${error.message}` }, { status: 500 });
        }
        
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

