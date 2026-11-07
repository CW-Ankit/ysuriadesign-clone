import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yogi Suria — Design Engineer",
  description:
    "Yogi Suria — a one-person design engineer and marketing motion designer. Brand, product, motion and code, from sketch to shipped.",
  icons: {
    icon: "data:,",
  },
  openGraph: {
    title: "Yogi Suria — Design Engineer",
    description:
      "Yogi Suria — a one-person design engineer and marketing motion designer. Brand, product, motion and code, from sketch to shipped.",
    type: "website",
    url: "https://ysuriadesign.co",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/geist-latin-var.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
