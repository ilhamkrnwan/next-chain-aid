"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, BookOpen, Wallet, Zap, Settings, ChevronDown, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  {
    label: "Organisasi",
    icon: Building2,
    submenu: [
      { label: "Pending", href: "/admin/organisasi/pending" },
      { label: "Semua", href: "/admin/organisasi" },
    ],
  },
  {
    label: "Campaign",
    icon: BookOpen,
    submenu: [
      { label: "Semua", href: "/admin/campaign" },
      { label: "Perlu Review", href: "/admin/campaign/review" },
    ],
  },
  { label: "Transaksi", href: "/admin/transaksi", icon: Wallet },
  { label: "Blockchain", href: "/admin/blockchain", icon: Zap },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Toggle - Fixed positioning */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] lg:hidden bg-white shadow-md hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-card border-r border-border flex flex-col",
          "fixed lg:relative h-screen z-50 lg:z-0",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">ChainAid Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn("w-4 h-4 transition-transform flex-shrink-0", expandedMenu === item.label && "rotate-180")}
                    />
                  </button>
                  {expandedMenu === item.label && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-4 py-2 rounded-lg text-sm transition-colors",
                            pathname === sub.href
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
