"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Mengambil profil pengguna untuk pengecekan peran (role)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      // Pengalihan berdasarkan peran
      if (profile?.role === "admin") {
        router.push("/admin")
      } else if (profile?.role === "org") {
        router.push("/org")
      } else {
        router.push("/")
      }
      
      router.refresh()
    } catch (error: any) {
      setError(error.message?.toUpperCase() || "LOGIN GAGAL. PERIKSA KEMBALI KREDENSIAL ANDA.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Pesan Galat */}
      {error && (
        <div className="bg-red-400 border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6 text-slate-900 shrink-0" />
          <p className="text-[10px] font-black text-slate-900 uppercase leading-none">
            {error}
          </p>
        </div>
      )}

      {/* Bidang Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-900 italic">
          Alamat Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="NAMA@EXAMPLE.COM"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-slate-300 font-bold uppercase italic"
        />
      </div>

      {/* Bidang Kata Sandi */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-900 italic">
          Kata Sandi
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-none transition-all font-bold pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Ingat Saya */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              className="peer appearance-none w-6 h-6 border-4 border-slate-900 rounded-md bg-white checked:bg-yellow-400 transition-all cursor-pointer" 
            />
            <ShieldCheck className="absolute w-4 h-4 text-slate-900 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-tighter text-slate-600 group-hover:text-slate-900">Ingat Perangkat Ini</span>
        </label>
      </div>

      {/* Tombol Login */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-blue-600 hover:bg-blue-600 border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-white text-xl font-black uppercase italic tracking-tighter"
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span>AUTENTIKASI...</span>
          </div>
        ) : (
          "MASUK SEKARANG"
        )}
      </Button>
    </form>
  )
}