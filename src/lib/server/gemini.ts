export interface CancellationInstructions {
    normalizedServiceName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTimeMinutes: number;
    steps: string[];
    directLink: string;
}

/**
 * Fetches tailored cancellation instructions and service name normalization
 * from the Gemini API using structured JSON output.
 */
export async function getCancellationInstructions(serviceName: string): Promise<CancellationInstructions> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error('API_KEY environment variable is not configured');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Analyze the subscription name: "${serviceName}".
Identify the correct service name and provide detailed, step-by-step instructions on how a user can cancel/unsubscribe from this service. 
Ensure you normalize the service name (e.g. "NETFLIX US" or "netflix-premium" to "Netflix").
Be as specific and tailored as possible to this service.`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            normalizedServiceName: { type: 'STRING' },
                            difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
                            estimatedTimeMinutes: { type: 'INTEGER' },
                            steps: {
                                type: 'ARRAY',
                                items: { type: 'STRING' }
                            },
                            directLink: { type: 'STRING', description: 'The direct URL to the cancellation/subscription settings page of the service, if known and stable. Otherwise, empty string.' }
                        },
                        required: ['normalizedServiceName', 'difficulty', 'estimatedTimeMinutes', 'steps', 'directLink']
                    }
                }
            })
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API request failed with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('Empty response received from Gemini API');
    }

    return JSON.parse(text) as CancellationInstructions;
}
