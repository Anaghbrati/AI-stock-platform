import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Stock Platform",
  description: "AI-powered stock analysis and market intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}