import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";    // یہ شامل کریں
import { Footer } from "@/components/layout/footer";    // یہ شامل کریں

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TechShop - Premium Computer & Mobile Accessories",
    template: "%s | TechShop",
  },
  description: "Your one-stop shop for premium computer and mobile accessories. Quality products with excellent service.",
  keywords: "computer accessories, mobile accessories, tech shop, electronics, gadgets, gaming accessories, audio equipment",
  authors: [{ name: "Hafiz Sajid Syed" }],
  creator: "Hafiz Sajid Syed",
  publisher: "TechShop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TechShop - Premium Computer & Mobile Accessories",
    description: "Your one-stop shop for premium computer and mobile accessories. Quality products with excellent service.",
    url: "https://techshop.com",
    siteName: "TechShop",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TechShop",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechShop - Premium Computer & Mobile Accessories",
    description: "Your one-stop shop for premium computer and mobile accessories.",
    images: ["/twitter-image.jpg"],
    creator: "@techshop",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          <Navbar />        {/* یہ شامل کریں - سب سے اوپر navbar */}
          
          <main className="flex-1">{children}</main>  {/* main میں flex-1 لگائیں */}
          
          <Footer />        {/* یہ شامل کریں - سب سے نیچے footer */}
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "12px",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
              loading: {
                duration: 2000,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}