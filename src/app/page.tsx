import { LogoCloud } from '@/components/marketing/LogoCloud';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StructuredData } from '@/components/marketing/StructuredData';
import { Hero } from '@/components/marketing/sections/Hero';
import { HowItWorks } from '@/components/marketing/sections/HowItWorks';
import {
    Calculator,
    Faq,
    FinalCta,
    Pricing,
    Security,
    TestimonialsSection,
    Tour,
    WhyCards,
} from '@/components/marketing/sections/LandingSections';
import { Problem } from '@/components/marketing/sections/Problem';

export default function HomePage() {
    return (
        <>
            <StructuredData />
            <SiteHeader />
            <main id="main" className="w-full max-w-full overflow-x-hidden bg-white text-ink">
                <Hero />
                <LogoCloud />
                <Problem />
                <HowItWorks />
                <Tour />
                <WhyCards />
                <Calculator />
                <Security />
                <TestimonialsSection />
                <Pricing />
                <Faq />
                <FinalCta />
            </main>
            <SiteFooter />
        </>
    );
}
