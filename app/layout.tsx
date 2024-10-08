"use client"

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from 'next/navigation'

// Import the components
import NavBar from "@/components/NavBar/NavBar";
import SideBar from "@/components/SideBar/SideBar";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/image/sparqs_logo.png" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/image/sparqs_logo.png" />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col h-screen box-border">
          <NavBar />
          <div className="flex flex-1 overflow-hidden box-border">
            <SideBar />
            <main className="flex-1 p-4 overflow-auto box-border">
              <NextTopLoader color='#F1F1F1' />
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}