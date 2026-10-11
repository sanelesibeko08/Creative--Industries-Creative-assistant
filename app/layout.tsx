import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creative Ideation Assistant",
  description:
    "AI-powered tool for brainstorming, structuring, and drafting creative content — powered by IBM Granite via watsonx.ai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full bg-background text-foreground">
        <SessionProvider>
          {/* Sidebar is hidden on mobile via CSS */}
          <div className="hidden md:flex md:flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
