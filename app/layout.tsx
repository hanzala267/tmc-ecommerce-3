import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TMC - Premium Marinated Chicken",
  description:
    "Fresh, premium marinated chicken delivered to your doorstep in Faisalabad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
