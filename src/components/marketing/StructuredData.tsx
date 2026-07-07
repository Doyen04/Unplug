export function StructuredData() {
    const appSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Unplug',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'NGN',
        },
        description:
            'Subscription control for Nigeria — a dedicated virtual card per recurring charge, frozen or cancelled instantly.',
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is my banking information safe?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Your bank connection is read-only and used only once to identify subscriptions.',
                },
            },
            {
                '@type': 'Question',
                name: 'How is this different from freezing a card in my bank app?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Unplug freezes one merchant card instead of the whole bank card, so your other payments keep working.',
                },
            },
            {
                '@type': 'Question',
                name: 'What happens with my dollar subscriptions?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'USD subscriptions are handled in the same dashboard alongside Naira subscriptions.',
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
    );
}
