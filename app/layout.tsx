import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Navbar }      from "@/components/layout/Navbar";
import { BottomNav }   from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#171717",
};

export const metadata: Metadata = {
  title: "Family Travel Planner — Rhodes 2026",
  description: "Personal travel manager — Rhodes, Greece, September 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Travel Planner",
  },
  icons: {
    icon: [
      { url: "/icon.svg",     type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192",     type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512",     type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"  content="black-translucent" />
        <meta name="apple-mobile-web-app-title"             content="Travel Planner" />
        <link rel="apple-touch-icon"                        href="/icon-192.png" />
      </head>
      <body
        className="min-h-full bg-white text-[#171717]"
        style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}
      >
        <PwaRegister />
        <div className="hidden md:block">
          <Navbar />
        </div>
        <main className="pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
