import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InflConnect — Find Local Influencers in India",
    template: "%s | InflConnect",
  },
  description:
    "Discover and connect with top local influencers across Indian cities. Find lifestyle, tech, fashion, beauty, fitness, and gaming creators in Mumbai, Delhi, Bangalore, Patna, and more.",
  keywords: [
    "influencers India",
    "local influencers",
    "influencer marketing",
    "brand collaborations",
    "influencers in Patna",
    "influencers in Mumbai",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "InflConnect",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main>{children}</main>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
