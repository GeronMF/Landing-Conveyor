import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { I18nProvider } from '@/lib/i18n/context';
import { GtmTopcinaBody, GtmTopcinaHead } from '@/components/gtm-topcina';

const GOOGLE_ADS_ID = 'AW-18058618634';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Офіційна сторінка оформлення замовлень',
  description: 'Офіційна сторінка підтримки та оформлення замовлень',
  icons: {
    icon: '/api/favicon?v=2',
    shortcut: '/api/favicon?v=2',
    apple: '/api/favicon?v=2',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <GtmTopcinaHead />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <GtmTopcinaBody />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
