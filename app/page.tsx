import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/home-hero';
import { TrustSection } from '@/components/home/trust-section';
import { HowWeWork } from '@/components/home/how-we-work';
import { ContactSection } from '@/components/home/contact-section';
import { InfoSection } from '@/components/home/info-section';
import { HomeFooter } from '@/components/home/home-footer';

export const metadata: Metadata = {
  title: 'Официальная страница оформления заказов',
  description:
    'Поддержка и оформление заказов. Используйте страницу предложения для покупки выбранного товара.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
        <HomeHero />
        <TrustSection />
        <HowWeWork />
        <ContactSection />
        <InfoSection />
        <HomeFooter />
    </main>
  );
}
