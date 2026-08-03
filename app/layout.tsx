import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "robertkotcher.com - App Ideas Built Personally",
  description:
    "Robert Kotcher helps people turn app ideas into working software with direct weekly support, clear communication, and senior technical execution.",
  icons: {
    icon: "/rk-mark.svg",
    shortcut: "/rk-mark.svg",
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
