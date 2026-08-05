import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CLOUTMERCHANT — Social growth services, wallet-simple",
    template: "%s · CLOUTMERCHANT",
  },
  description:
    "Fund one wallet, order social-media growth services across Instagram, TikTok, YouTube, X, Facebook and Telegram, and track every order in one dashboard.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Keeps forms reachable when the mobile keyboard opens (spec §5 auth).
  viewportFit: "cover",
  themeColor: "#14151a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
