import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SupportOps | Customer Support & SLA Automation",
  description: "Enterprise Customer Support Ticket & SLA Automation Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[#FAFAFA] text-[#1F2933] font-sans selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
