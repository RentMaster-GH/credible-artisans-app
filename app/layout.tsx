import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credible Artisans",
  description:
    "CredibleArtisans.com helps customers find trusted artisans and manage jobs across multiple countries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
