import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolOS - See your school's money clearly",
  description: "The daily operations app for African school owners - fees, attendance, admissions, and what needs your attention today, all in one place.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#1B3A6B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
