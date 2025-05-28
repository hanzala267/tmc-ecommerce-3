import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default:
      "Marinzo - Premium Marinated Chicken | Fresh Delivery in Faisalabad",
    template: "%s | Marinzo",
  },
  description:
    "Order premium marinated chicken online in Faisalabad. 6 signature recipes, same-day delivery, cash on delivery. Perfect for families & businesses. Natural ingredients, no preservatives.",
  keywords: [
    "marinated chicken",
    "premium chicken",
    "chicken delivery Faisalabad",
    "natural chicken",
    "signature recipes",
    "bulk chicken orders",
    "fresh chicken",
    "cash on delivery",
    "Marinzo",
  ],
  authors: [{ name: "Marinzo Team" }],
  creator: "Marinzo",
  publisher: "Marinzo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    title: "Marinzo - Premium Marinated Chicken",
    description:
      "Discover the finest marinated chicken with Marinzo. Fresh, natural, and bursting with flavor. Perfect for families and businesses in Faisalabad.",
    url: "https://www.marinzo.com",
    siteName: "Marinzo",
    images: [
      {
        url: "https://www.marinzo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Marinzo - Premium Marinated Chicken",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marinzo - Premium Marinated Chicken",
    description:
      "Order premium marinated chicken online in Faisalabad. Fresh, natural, and bursting with flavor. Perfect for families and businesses.",
    images: ["https://www.marinzo.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="BBsvzoQgGJNHSILAsFX6x8WBiVCqaKsW8p4LnsgVBso"
        />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
