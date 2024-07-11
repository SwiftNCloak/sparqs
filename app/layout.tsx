import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Import the components
import NavBar from "@/components/NavBar/NavBar";
import SideBar from "@/components/SideBar/SideBar";

export const metadata: Metadata = {
  title: "SparQs",
  description: "Generate ideas!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col h-screen box-border">
          <NavBar />
          <div className="flex flex-1 overflow-hidden box-border">
            <SideBar />
            <main className="flex-1 p-4 overflow-auto box-border">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}