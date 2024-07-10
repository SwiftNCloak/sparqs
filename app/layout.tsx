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
        <NavBar />
        <div className="flex">
          <SideBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
