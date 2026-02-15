import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://reelytics.io"),
  title: {
    default: "Reelytics — Analytics for Short-Form Series Creators",
    template: "%s | Reelytics",
  },
  description:
    "Stop guessing. Start optimizing. Analytics and paywall optimization for short-form series creators on ReelShort, DramaBox, ShortTV, and more.",
  keywords: [
    "micro-drama analytics",
    "short-form series",
    "ReelShort analytics",
    "DramaBox analytics",
    "creator analytics",
    "paywall optimization",
    "episode performance",
    "retention tracking",
  ],
  authors: [{ name: "Reelytics" }],
  creator: "Reelytics",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Reelytics",
    title: "Reelytics — Analytics for Short-Form Series Creators",
    description:
      "Stop guessing. Start optimizing. Analytics and paywall optimization for short-form series creators.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
