import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fred Hiring System",
  description: "Role-specific restaurant candidate assessment.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
