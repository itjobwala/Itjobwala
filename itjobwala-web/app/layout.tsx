import type { Metadata } from "next";
import { Inter } from "next/font/google";
import RootProvider from "@/src/providers/RootProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "itJobwala – Find IT Jobs",
  description: "Find IT jobs without the noise. Apply directly. No middlemen. No spam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body className="bg-white text-[#0f172a] min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
