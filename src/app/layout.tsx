import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrinityTalks — 三元空间",
  description: "知识与搞钱 · 思想、认知、商业智慧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} antialiased`}>
        <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-8">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <Image src="/logo.jpg" alt="TrinityTalks" width={28} height={28} className="rounded-md" />
              <span className="text-[15px] font-semibold tracking-tight text-[#e5e5e5]">TrinityTalks</span>
            </Link>
            <nav className="flex items-center gap-5">
              <Link href="/column" className="text-[13px] text-[#888] transition-colors hover:text-[#06b6d4]">专栏</Link>
              <Link href="/money" className="text-[13px] text-[#888] transition-colors hover:text-[#06b6d4]">搞钱</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
