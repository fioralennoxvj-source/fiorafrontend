import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { formatStrapiUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://192.168.1.50:1337';

async function getBrandingData() {
  try {
    const query = new URLSearchParams({
      'populate[logoBlack][populate]': '*',
      'populate[logoWhite][populate]': '*'
    });
    const res = await fetch(`${STRAPI_URL}/api/homepage?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Fiora Lennox | Premium Natural Diamonds",
  description: "A world-class e-commerce destination focusing on the ethos of natural diamonds.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingData();
  const logoBlack = formatStrapiUrl(branding?.logoBlack?.url);
  const logoWhite = formatStrapiUrl(branding?.logoWhite?.url);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CartProvider>
            <Navbar logoBlack={logoBlack} logoWhite={logoWhite} />
            <CartDrawer />
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
