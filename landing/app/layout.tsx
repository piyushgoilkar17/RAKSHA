import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "RakshaAI | Autonomous Disaster Intelligence",
  description:
    "Autonomous disaster-response hexacopter. Edge AI, dual RGB-thermal perception, and coordinated mission intelligence.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
