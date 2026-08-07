import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Robert Kotcher Web Studio",
  description:
    "Robert Kotcher Web Studio builds and maintains clear, practical websites for small businesses.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/rk-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
