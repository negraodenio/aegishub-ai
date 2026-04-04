import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "MindOps // PsicoRisco PT",
  description: "Plataforma de gestão de riscos psicossociais, conformidade e assistência assistida (M2.7 Audit Ready)"
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
