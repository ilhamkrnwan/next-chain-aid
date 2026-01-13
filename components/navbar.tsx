"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { ShieldCheck, User, LogOut, History, LayoutDashboard, Menu, X, Zap } from "lucide-react"
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
import { cn } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false); }
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
    setMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const getDashboardLink = () => {
    if (profile?.role === "admin") return "/admin"
    if (profile?.role === "org") return "/org"
    return "/profile"
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  // NAV LINKS SINKRON DENGAN FOOTER
  const navLinks = [
    { href: "/", label: "BERANDA" },
    { href: "/campaigns", label: "DONASI" },
    { href: "/transparansi", label: "TRANSPARANSI" },
    { href: "/about", label: "TENTANG" }, 
  ]

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO NEO-BRUTAL */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 border-2 border-slate-900 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">
            Chain<span className="text-blue-600">Aid</span>
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-black tracking-widest text-slate-500 hover:text-blue-600 uppercase transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <div className="scale-90 border-2 border-slate-900 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-white">
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse border-2 border-slate-900" />
          ) : user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* BUTTON AVATAR BULAT */}
                <button className="relative h-12 w-12 rounded-full border-4 border-slate-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all focus:outline-none">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
                      {getInitials(profile.full_name || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-4 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-2 bg-white" align="end">
                <DropdownMenuLabel className="p-4 bg-slate-50 rounded-xl mb-2 border-2 border-slate-100">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">{profile.full_name || "Pengguna"}</p>
                  <p className="text-[10px] font-bold text-slate-500 truncate">{user.email}</p>
                  <div className="mt-2 inline-block px-2 py-0.5 bg-blue-600 text-[9px] font-black text-white uppercase rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {profile.role === "org" ? "ORGANISASI" : profile.role || "DONATUR"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-900 h-0.5 my-1" />
                <DropdownMenuItem asChild className="p-3 focus:bg-blue-50 cursor-pointer font-bold uppercase text-[10px] rounded-lg">
                  <Link href={getDashboardLink()} className="flex items-center">
                    <LayoutDashboard className="mr-3 h-4 w-4 text-blue-600" /> PANEL KENDALI
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-3 focus:bg-blue-50 cursor-pointer font-bold uppercase text-[10px] rounded-lg">
                  <Link href="/history" className="flex items-center">
                    <History className="mr-3 h-4 w-4 text-blue-600" /> RIWAYAT TRANSAKSI
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-900 h-0.5 my-1" />
                <DropdownMenuItem onClick={handleLogout} className="p-3 focus:bg-red-50 cursor-pointer font-bold uppercase text-[10px] text-red-600 rounded-lg">
                  <LogOut className="mr-3 h-4 w-4" /> KELUAR AKUN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-black uppercase italic tracking-widest text-[10px] hover:bg-slate-100 h-10">
                  MASUK
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-yellow-400 text-slate-900 border-2 border-slate-900 font-black uppercase italic tracking-widest text-[10px] px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-xl h-10">
                  DAFTAR
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white active:shadow-none transition-all"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t-4 border-slate-900 p-6 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-black uppercase italic tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 flex items-center justify-between group"
              >
                {link.label}
                <Zap className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t-2 border-dashed border-slate-200 space-y-4">
             <div className="flex justify-center border-2 border-slate-900 rounded-xl overflow-hidden p-2 bg-slate-50">
                <ConnectButton />
             </div>
             {!user && (
               <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-white border-2 border-slate-900 text-slate-900 font-black italic text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">MASUK</Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="w-full bg-blue-600 border-2 border-slate-900 text-white font-black italic text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">DAFTAR</Button>
                  </Link>
               </div>
             )}
          </div>
        </div>
      )}
    </nav>
  )
}