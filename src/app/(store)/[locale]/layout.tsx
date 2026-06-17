import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Bebas_Neue, Inter } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { getStoreConfig } from '@/lib/store-config';
import { db } from '@/lib/db';
import { themeToCssVars } from '@/lib/theme';
import { VerticalProvider } from '@/lib/vertical-context';
import { PresenceProvider } from '@/lib/presence-context';
import { CustomerProvider } from '@/lib/useCustomer';
import { getBaseUrl } from '@/lib/url';
import '../../globals.css';

export const dynamic = 'force-dynamic';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  const baseUrl = getBaseUrl();

  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${baseUrl}/${locale}`;
  }

  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: 'Kate Barber Studio — Haircuts · Beard · Styling for everyone',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: config.name,
      title: `${config.name} — Haircuts · Beard · Styling`,
      description: 'Kate Barber Studio — Premium barbershop in Trenčín. Haircuts, beard grooming and styling for everyone.',
      url: baseUrl,
      locale: 'sk_SK',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.name} — Barbershop Trenčín`,
      description: 'Kate Barber Studio — Premium barbershop. Haircuts, beard grooming and styling.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F0EA' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const config = await getStoreConfig();
  const cssVars = themeToCssVars(config.theme);

  const footerCategories = config.vertical.vertical === 'RESTAURANT'
    ? await db.category.findMany({
        where: { storeId: config.id },
        select: { slug: true, nameKey: true },
        orderBy: { sortOrder: 'asc' },
      })
    : undefined;

  return (
    <html lang={locale} data-vertical={config.vertical.vertical} className={`${bebasNeue.variable} ${inter.variable}`}>
      <body style={cssVars as React.CSSProperties}>
        <NextIntlClientProvider messages={messages}>
          <CustomerProvider>
            <VerticalProvider config={config.vertical}>
              <PresenceProvider presence={config.presence}>
                <Header storeName={config.name} vertical={config.vertical.vertical} phone={config.presence.phone} />
                <main>{children}</main>
                <Footer storeName={config.name} vertical={config.vertical.vertical} menuCategories={footerCategories} />
              </PresenceProvider>
            </VerticalProvider>
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
