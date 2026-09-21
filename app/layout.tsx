import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Design system (reference/Planejamento-Priscila.html): Fraunces pros
// títulos/números de destaque (font-display) e Inter pro corpo — Inter é o
// font-family do body em globals.css, então vale pro app inteiro.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MVP Planejamento Financeiro",
  description: "Planejamento financeiro dinâmico para assessores.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
