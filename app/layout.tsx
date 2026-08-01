import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CampusOS — Smart Campus Operating System",
    template: "%s | CampusOS",
  },
  description: "Premium multi-tenant AI-powered campus platform for modern educational institutions. Streamline operations, enhance engagement, and drive excellence.",
  keywords: ["campus management", "education platform", "student portal", "college management system", "LMS", "SaaS"],
  authors: [{ name: "CampusOS Team" }],
  creator: "CampusOS",
  publisher: "CampusOS",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)',  color: '#8B5CF6' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
