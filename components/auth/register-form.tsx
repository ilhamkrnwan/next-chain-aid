"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("PASSWORD MINIMAL 6 KARAKTER!")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("PASSWORD TIDAK COCOK, CEK LAGI!")
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message?.toUpperCase() || "PENDAFTARAN GAGAL!")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-400 border-4 border-slate-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-6">
          <CheckCircle2 className="w-12 h-12 text-slate-900" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 uppercase italic leading-none">BERHASIL DAFTAR!</h3>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter italic">
            Cek email ente buat verifikasi. <br /> Otomatis ke halaman login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Error Message Brutalist Style */}
      {error && (
        <div className="bg-red-400 border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6 text-slate-900 shrink-0" />
          <p className="text-[10px] font-black text-slate-900 uppercase leading-none">
            {error}
          </p>
        </div>
      )}

      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-slate-900 italic">
          Nama Lengkap
        </Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="CONTOH: Dinda Mutiara"
          value={formData.fullName}
          onChange={handleChange}
          required
          disabled={loading}
          className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-slate-300 font-bold uppercase italic"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-900 italic">
          Email Institusi
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="XXXX@STUDENT.UNU-JOGJA.AC.ID"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-slate-300 font-bold uppercase italic"
        />
      </div>

      {/* Password Fields Wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-none transition-all font-bold pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
            Konfirmasi
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="******"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-none transition-all font-bold pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button Neo-Brutalism */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-blue-600 hover:bg-blue-600 border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-white text-xl font-black uppercase italic tracking-tighter"
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span>PROSES...</span>
          </div>
        ) : (
          "DAFTAR SEKARANG!"
        )}
      </Button>
    </form>
  )
}