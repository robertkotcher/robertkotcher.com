import type { Metadata } from "next";
import { EB_Garamond, Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.robertkotcher.com"),
  title: "Robert Kotcher | Serial Founding Engineer",
  description:
    "Robert Kotcher is a founding software engineer focused on data-driven product development, clear communication, and empathetic teams.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Robert Kotcher | Serial Founding Engineer",
    description:
      "Founding software engineer with a proven track record building and growing products.",
    url: "/",
    siteName: "Robert Kotcher",
    type: "profile",
  },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
    shortcut: "/favicon.svg",
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
      <body className={`${garamond.variable} ${ubuntu.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
