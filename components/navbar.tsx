"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { ShieldCheck, User, LogOut, History, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
    setProfile(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getDashboardLink = () => {
    if (profile?.role === "admin") return "/admin"
    if (profile?.role === "org") return "/org"
    return "/profile" // User biasa ke profile, bukan dashboard
  }

  const getDashboardLabel = () => {
    if (profile?.role === "admin") return "Dashboard Admin"
    if (profile?.role === "org") return "Dashboard Organisasi"
    return "Profil Saya" // User biasa
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <span>ChainAid</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-10 text-sm font-medium text-muted-foreground">
            <Link href="/campaigns" className="hover:text-primary transition-colors">
              Donasi
            </Link>
            <Link href="/transparansi" className="hover:text-primary transition-colors">
              Transparansi
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              Tentang Kami
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
          ) : user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(profile.full_name || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {profile.role && (
                      <p className="text-xs leading-none text-blue-600 font-medium capitalize mt-1">
                        {profile.role === "org" ? "Organisasi" : profile.role}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer">
                    {profile?.role === "user" ? (
                      <User className="mr-2 h-4 w-4" />
                    ) : (
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                    )}
                    <span>{getDashboardLabel()}</span>
                  </Link>
                </DropdownMenuItem>
                {(profile?.role === "admin" || profile?.role === "org") && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/history" className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>Riwayat Donasi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
