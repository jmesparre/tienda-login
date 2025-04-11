import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from '@/context/CartContext'; // Import CartProvider
import CartSidebar from '@/components/CartSidebar'; // Import CartSidebar
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Vieja Estacion",
  description: "E-commerce La Vieja Estacion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider> {/* Wrap with CartProvider */}
          <Theme>
            {children} {/* Main page content */}
            <CartSidebar /> {/* Add sidebar here */}
          </Theme>
        </CartProvider>
      </body>
    </html>
  );
}
