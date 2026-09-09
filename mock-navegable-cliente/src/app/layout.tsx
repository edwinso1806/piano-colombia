import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

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
      <body className="min-h-full flex flex-col bg-[#F9F9FF] text-[#111C2D] font-sans overflow-x-hidden w-full max-w-full relative">
        <CartProvider>{children}</CartProvider>
        
        {/* Badge Flotante para Diferenciar el Mock del Proyecto Real */}
        <div className="fixed bottom-3 right-3 z-[99999] pointer-events-none">
          <div className="bg-[#111C2D]/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xl border border-[#FBB03B]/40 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FBB03B] animate-pulse"></span>
            <span>🎭 Mock Navegable Cliente (Puerto 3001)</span>
          </div>
        </div>
      </body>
    </html>
  );
}

