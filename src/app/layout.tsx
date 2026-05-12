import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leaders in Purpose",
  description:
    "Een premium app voor jongerenleiders: agenda, jongeren-zorg, events, berichten en verjaardagen op één plek.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${geistSans.variable} h-full`}>
      <body className="h-full bg-background text-foreground antialiased">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 lg:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
