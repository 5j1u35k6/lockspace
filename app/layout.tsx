import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lockspace｜成人會員任務社群",
  description: "需登入與完成註冊的成人會員任務驗證平台。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
