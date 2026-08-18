import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/services/store";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Yavatmal Unified Panchayat Operations Platform",
  description:
    "Role-based digital operations, governance, maintenance, compliance and participation platform for Zilla Parishad Yavatmal. Demonstration prototype.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Yavatmal Panchayat" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1f4e8f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreProvider>{children}</StoreProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
