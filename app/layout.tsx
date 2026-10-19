import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuildProfile AI — Master Your Professional Presence & LinkedIn Authority",
  description: "Next-generation AI profile audit engine, high-impact content studio, personalized cold outreach, and career roadmaps tailored for ambitious tech professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
