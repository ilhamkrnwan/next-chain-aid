"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Mail, AlertCircle } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message?.toUpperCase() || "GAGAL MENGIRIM PERMINTAAN RESET PASSWORD.")
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
          <h3 className="text-3xl font-black text-slate-900 uppercase italic leading-none">EMAIL TERKIRIM!</h3>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-tight italic px-4">
            Tautan pemulihan kata sandi telah dikirimkan ke alamat email: <br />
            <span className="text-blue-600 bg-blue-50 px-1">{email}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pesan Galat */}
      {error && (
        <div className="bg-red-400 border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-6 h-6 text-slate-900 shrink-0" />
          <p className="text-[10px] font-black text-slate-900 uppercase leading-none">
            {error}
          </p>
        </div>
      )}

      {/* Informasi Instruksi */}
      <div className="bg-yellow-300 border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
        <div className="bg-white border-2 border-slate-900 p-1 rounded-lg">
          <Mail className="w-5 h-5 text-slate-900 flex-shrink-0" />
        </div>
        <p className="text-[11px] font-black text-slate-900 uppercase leading-tight italic">
          Masukkan alamat email yang telah terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
        </p>
      </div>

      {/* Bidang Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-900 italic">
          Alamat Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="CONTOH: NAMA@STUDENT.UNU-JOGJA.AC.ID"
          value={email}
          onChange={(e) => setEmail(e.target.value.toUpperCase())}
          required
          disabled={loading}
          className="h-14 border-4 border-slate-900 rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-slate-300 font-bold uppercase italic"
        />
      </div>

      {/* Tombol Kirim */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-pink-500 hover:bg-pink-500 border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-white text-xl font-black uppercase italic tracking-tighter"
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span>MENGIRIM...</span>
          </div>
        ) : (
          "KIRIM TAUTAN RESET"
        )}
      </Button>
    </form>
  )
}