import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EmotionFieldLoader } from "@/components/emotion/EmotionFieldLoader";
import { EmotionProvider } from "@/components/emotion/EmotionProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Free Tone Converter | Rewrite Angry or Messy Text Professionally",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Rewrite angry, casual or unclear messages into polite, professional text. Free tone converter for emails, chat and anything else you have to send.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">
        <EmotionProvider>
          <EmotionFieldLoader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </EmotionProvider>
      </body>
    </html>
  );
}
