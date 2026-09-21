import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif } from 'next/font/google';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { getRepository } from '@/data';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofnucci.example'),
  title: {
    default: 'House of Nucci — The Collection',
    template: '%s · House of Nucci',
  },
  description:
    'House of Nucci is a private collection of digital art, presented as a museum, an archive and a set of artist records.',
  openGraph: {
    siteName: 'House of Nucci',
    type: 'website',
  },
  robots: { index: true, follow: true },
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
