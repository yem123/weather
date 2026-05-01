import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather App (Next.js + TypeScript)",
  description: "A modern weather app built with Next.js App Router + TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}