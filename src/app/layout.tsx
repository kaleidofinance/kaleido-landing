import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Web3Provider } from "@/providers/Web3Provider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "Kaleido DeFi-OS | The Autonomous Financial Layer",
  description: "Experience the world's first DeFi Operating System powered by Luca AI. Deploy, Stake, and Reason with Kaleido.",
  icons: "./favicon.ico"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-white bg-black`}>
        {/* Google Analytics - gtag.js */}
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
          `,
          }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
          strategy="afterInteractive"
        />
        <QueryProvider>
          <Web3Provider>
            <ModalProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1A1B23',
                    color: '#fff',
                    borderRadius: '12px',
                  },
                }}
              />
              {children}
            </ModalProvider>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  );
}
