import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AegisHub AI — AI-Powered Psychosocial Risk Intelligence",
  description: "Plataforma de Inteligência Artificial para avaliação, prevenção, monitoramento e gestão de riscos psicossociais para empresas e operadores de SST (Portugal e Brasil).",
  manifest: "/manifest.json",
};

import { SOSChatWidget } from "../features/sos/components/SOSChatWidget";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" className={`${inter.variable}`}>
      <body className="antialiased selection:bg-brand selection:text-white">
        {children}
        <SOSChatWidget />
      </body>
    </html>
  );
}
