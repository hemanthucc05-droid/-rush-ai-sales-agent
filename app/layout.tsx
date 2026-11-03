import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUSH — AI Sales Workspace",
  description: "AI-powered WhatsApp sales workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
