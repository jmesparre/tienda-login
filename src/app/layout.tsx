import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import type { Metadata } from "next";
import { Geist, Geist_Mono} from "next/font/google";
import { CartProvider } from '@/context/CartContext'; // Import CartProvider
import CartSidebar from '@/components/CartSidebar'; // Import CartSidebar
import Footer from '@/components/Footer'; // Import Footer
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
  title: "Tienda San Luis",
  description: "E-commerce Tienda San Luis",
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
            <Footer /> {/* Add footer here */}
          </Theme>
        </CartProvider>
      </body>
    </html>
  );
}
