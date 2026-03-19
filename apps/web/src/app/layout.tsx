import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steel MR Inspection Web",
  description: "Minimal Next.js web app for project list and detail screens",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}