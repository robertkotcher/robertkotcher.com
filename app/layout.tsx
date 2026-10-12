import type { Metadata } from "next";
import { EB_Garamond, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.robertkotcher.com"),
  title: "Robert Kotcher | Engineering, Product & Startups",
  description:
    "Robert Kotcher is a founder and engineering team lead with experience across product, growth, AI, developer tools, and early-stage startups.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Robert Kotcher | Engineering, Product & Startups",
    description:
      "Founder and engineering team lead building and growing products across AI, developer tools, and early-stage startups.",
    url: "/",
    siteName: "Robert Kotcher",
    type: "profile",
  },
  icons: {
    icon: { url: "/portrait-favicon.svg", type: "image/svg+xml" },
    shortcut: "/portrait-favicon.svg",
    apple: "/robert-kotcher-portrait.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${garamond.variable} ${openSans.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
