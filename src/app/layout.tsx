import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { absoluteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "AFTO Connect — Tu tarjeta inteligente para networking",
    template: "%s · AFTO Connect",
  },
  description:
    "Comparte tu contacto, capta leads y mide cada encuentro. Networking inteligente con QR, NFC e IA.",
  openGraph: {
    type: "website",
    siteName: "AFTO Connect",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
