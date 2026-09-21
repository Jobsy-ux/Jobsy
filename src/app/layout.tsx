import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif } from 'next/font/google';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { getRepository } from '@/data';
import { absoluteUrl, COLLECTION_NAME, IS_PRODUCTION_MODE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

/**
 * The pairing (§04): a high-contrast editorial serif for the institution's voice, and a
 * neutral grotesque for everything the interface says about itself. Two families, no
 * more — see DECISIONS.md O-6 on licensing a distinctive display face.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const text = Archivo({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
});

export const metadata: Metadata = {
  /* Every relative URL in page metadata resolves against the canonical origin. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — The Collection`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${COLLECTION_NAME}`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl('/'),
    type: 'website',
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${COLLECTION_NAME}`,
    description: SITE_DESCRIPTION,
  },
  /* Only a production build is offered to search engines; staging carries demo records. */
  robots: IS_PRODUCTION_MODE ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0d0e10',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = getRepository().hasPlaceholders();

  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>
        <a href="#main" className="hon-skip">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter isDemo={isDemo} />
      </body>
    </html>
  );
}
