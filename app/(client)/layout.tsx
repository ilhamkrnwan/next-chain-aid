import type React from "react"
import { Navbar } from "@/components/navbar"
import { Toaster } from "sonner"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {children}
      </div>
      <Toaster position="top-right" richColors />
    </>
  )
}
