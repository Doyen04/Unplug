import { headers } from 'next/headers';
import Link from 'next/link';

const MONO_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ']);

const resolveCountry = (countryHeader: string | null, languageHeader: string | null): string => {
  if (countryHeader && countryHeader.length === 2) {
    return countryHeader.toUpperCase();
  }

  const languageSuffix = languageHeader?.split(',')[0]?.split('-')[1];
  if (languageSuffix && languageSuffix.length === 2) {
    return languageSuffix.toUpperCase();
  }

  return 'US';
};

const ConnectAccountsPage = async () => {
  const requestHeaders = await headers();
  const countryCode = resolveCountry(
    requestHeaders.get('x-vercel-ip-country'),
    requestHeaders.get('accept-language')
  );

  const preferredProvider = MONO_COUNTRIES.has(countryCode) ? 'mono' : 'plaid';

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-10 text-stone-100 md:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl border border-stone-800 bg-stone-900 p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Account Connections</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-stone-100">Connect your accounts</h1>
        <p className="mt-5 text-sm leading-7 text-stone-300">
          We detected your location as <span className="text-stone-100">{countryCode}</span>. Choose
          your bank linking provider below.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <article
            className={`border p-4 ${preferredProvider === 'plaid'
              ? 'border-acid-green bg-acid-muted/30'
              : 'border-stone-700 bg-stone-950'
              }`}
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recommended in US/Canada</p>
            <h2 className="mt-2 font-display text-3xl text-stone-100">Plaid</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Best for US-focused bank connections with broad institution support.
            </p>
            <button
              type="button"
              className="mt-4 w-full border border-acid-green bg-acid-green px-4 py-2 text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim"
            >
              Setup Plaid
            </button>
          </article>

          <article
            className={`border p-4 ${preferredProvider === 'mono'
              ? 'border-acid-green bg-acid-muted/30'
              : 'border-stone-700 bg-stone-950'
              }`}
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recommended in Africa</p>
            <h2 className="mt-2 font-display text-3xl text-stone-100">Mono</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Best for Nigeria and supported African markets with regional banking coverage.
            </p>
            <button
              type="button"
              className="mt-4 w-full border border-acid-green bg-acid-green px-4 py-2 text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim"
            >
              Setup Mono
            </button>
          </article>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="border border-stone-600 px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-stone-100 hover:border-stone-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ConnectAccountsPage;
