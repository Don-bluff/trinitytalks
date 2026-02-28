import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrinityTalks",
  description: "TrinityTalks - 三元空间 · 知识与搞钱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} antialiased`}>
        <header className="border-b border-[#222222] bg-[#0a0a0a]/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-6 md:px-8">
            <Link href="/" className="text-lg font-medium tracking-tight text-[#e5e5e5] hover:text-[#06b6d4]">
              TrinityTalks
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
