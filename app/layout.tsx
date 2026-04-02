import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n/context';
import { GtmTopcinaBody, GtmTopcinaHead } from '@/components/gtm-topcina';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Landing Conveyor',
  description: 'Платформа для создания лендингов',
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
        <GtmTopcinaBody />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
