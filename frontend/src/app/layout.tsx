import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Get Data",
  description: "YouTube Shorts Automation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
