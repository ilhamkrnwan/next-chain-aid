import type React from "react"

/**
 * Blank Layout for Authentication Pages
 * This layout removes the navbar and provides a clean, minimal layout
 * for login, register, forgot-password, and reset-password pages
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted">
      {children}
    </div>
  )
}
