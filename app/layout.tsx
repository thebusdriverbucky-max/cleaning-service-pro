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
import { db as prisma } from "@/lib/db";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { StoreSettingsData } from "@/app/actions/settings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    // В новой схеме модель называется SiteSettings, но пока в базе может быть старая таблица
    // Если миграции еще не запущены, этот код может упасть, но мы работаем над трансформацией
    settings = await (prisma as any).siteSettings.findFirst();
  } catch (error) {
    // Fallback if table doesn't exist yet
  }

  const siteName = settings?.value || "CleanFlow — Professional Cleaning Service";
  const siteDescription = "Book professional cleaning services online. Residential, commercial, deep cleaning and more. Online payment or cash on site.";

  return {
    title: {
      default: siteName,
      template: `%s | CleanFlow`,
    },
    description: siteDescription,
    keywords: ["cleaning service", "house cleaning", "commercial cleaning", "book cleaning", "professional cleaners"],
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: siteName,
      description: siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await (prisma as any).siteSettings.findFirst();
  } catch (error) {
    // ignore
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
