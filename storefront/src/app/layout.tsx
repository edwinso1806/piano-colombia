import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SavedScoresProvider } from "@/context/SavedScoresContext";
import { LanguageProvider } from "@/context/LanguageContext";
import FloatingWhatsAppWidget from "@/components/FloatingWhatsAppWidget";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Piano Colombia | Archivo & Partituras Digitales",
  description: "Marketplace y archivo digital urtext del patrimonio pianístico de Colombia y Latinoamérica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F9FF] text-[#111C2D] font-sans overflow-x-hidden w-full max-w-full">
        <LanguageProvider>
          <AuthProvider>
            <SavedScoresProvider>
              <CartProvider>
                {children}
                <FloatingWhatsAppWidget />
              </CartProvider>
            </SavedScoresProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

