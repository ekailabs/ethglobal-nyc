import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/lib/providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VistAI - Intelligent AI Chat",
  description: "Chat with VistAI, an intelligent AI companion powered by blockchain technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}