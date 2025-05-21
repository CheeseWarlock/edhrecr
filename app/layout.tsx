import type { Metadata } from "next";
import { Proza_Libre } from "next/font/google";
import "./globals.css";

const prozaLibre = Proza_Libre({ weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_TITLE ?? ""} EDHRanker`,
  description: "A daily EDH card ranking game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={prozaLibre.className}>{children}</body>
    </html>
  );
}
