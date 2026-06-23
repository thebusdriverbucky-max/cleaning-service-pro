// File: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { TopContactBar } from "@/components/top-contact-bar";
import { Analytics } from "@vercel/analytics/react";
import { getSiteSettings } from "@/lib/settings";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { StoreSettingsData } from "@/app/actions/settings";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings.site_name || "CleanFlow — Professional Cleaning Service";
  const siteDescription = settings.seo_meta_description || "Book professional cleaning services online. Residential, commercial, deep cleaning and more. Online payment or cash on site.";
  const titleSuffix = settings.seo_title_suffix || " | CleanFlow";
  const ogImage = settings.seo_og_image || "/og-image.png";
  const favicon = settings.site_favicon || "/favicon.ico";
  const keywords = settings.seo_meta_keywords ? settings.seo_meta_keywords.split(',').map(k => k.trim()) : ["cleaning service", "house cleaning", "commercial cleaning", "book cleaning", "professional cleaners"];

  return {
    title: {
      default: siteName,
      template: `%s${titleSuffix}`,
    },
    description: siteDescription,
    keywords: keywords,
    icons: {
      icon: favicon,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: siteName,
      description: siteDescription,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
          zIndex={99999}
        />
        <SessionProvider>
          <SettingsProvider initialSettings={settings as unknown as StoreSettingsData}>
            <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
              <div className="flex flex-col min-h-screen bg-white text-slate-900">
                <TopContactBar />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <WhatsAppButton />
              <Toaster />
            </ThemeProvider>
          </SettingsProvider>
        </SessionProvider>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
