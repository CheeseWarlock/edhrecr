import type { Metadata } from "next";
import { Proza_Libre } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';

import "./globals.css";
import { getAvailableAndSpecialDays } from "./lib/daily-cards";
import { CalendarDay } from "./types";
import { CalendarContextProvider } from "./components/CalendarContextProvider";

const prozaLibre = Proza_Libre({ weight: ["400", "600"], subsets: ["latin"] });

const calendarDays: CalendarDay[] = await getAvailableAndSpecialDays();

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
      <body className={prozaLibre.className}>
        <CalendarContextProvider calendarDays={calendarDays}>
          {children}
        </CalendarContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
