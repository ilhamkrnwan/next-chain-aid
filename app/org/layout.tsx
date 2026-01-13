import type React from "react"
import { OrgSidebar } from "@/components/org/sidebar"
import { OrgTopBar } from "@/components/org/top-bar"
import { Toaster } from "sonner"

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OrgSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrgTopBar />
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
