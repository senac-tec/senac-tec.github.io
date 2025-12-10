import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EducaGestaoDF - Sistema de Gestão Escolar",
  description: "Sistema completo de gestão escolar para instituições de ensino",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-60">{children}</main>
        </div>
      </body>
    </html>
  )
}
