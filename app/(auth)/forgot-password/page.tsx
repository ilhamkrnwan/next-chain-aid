import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Zap, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Lupa Kata Sandi - ChainAid",
  description: "Atur ulang kata sandi akun ChainAid Anda",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* DEKORASI LATAR BELAKANG - RADIAL DOTS */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-md relative z-10">
        {/* LOGO & HEADER */}
        <div className="text-center mb-10">
          <Link href="/" className="group inline-block mb-6 relative">
            <div className="absolute inset-0 bg-pink-500 border-4 border-slate-900 rounded-xl translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
            <div className="relative bg-white text-slate-900 border-4 border-slate-900 px-6 py-2 rounded-xl flex items-center gap-2">
              <Zap className="w-5 h-5 fill-yellow-400 text-slate-900" />
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">ChainAid</h1>
            </div>
          </Link>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              PEMULIHAN <span className="text-pink-500">AKSES.</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
              Atur Ulang Kata Sandi Akun Anda
            </p>
          </div>
        </div>

        {/* FORGOT PASSWORD CARD */}
        <div className="relative group">
          {/* BAYANGAN KOTAK (SHADOW BOX) */}
          <div className="absolute inset-0 bg-yellow-400 border-4 border-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3"></div>
          
          {/* KARTU UTAMA */}
          <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 sm:p-10">
            {/* IKON DEKORATIF MELAYANG */}
            <div className="absolute -top-6 -right-6 bg-blue-600 border-4 border-slate-900 p-3 rounded-2xl rotate-12 hidden sm:block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>

            <ForgotPasswordForm />

            {/* NAVIGASI KEMBALI */}
            <div className="relative mt-8 pt-6 border-t-4 border-slate-900 border-dashed text-center">
              <Link href="/login" className="group inline-flex items-center gap-2 text-sm font-black text-slate-900 uppercase italic hover:text-blue-600 transition-colors">
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded group-hover:bg-blue-600 transition-colors">←</span>
                Kembali Ke Halaman Masuk
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER INFORMASI */}
        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
            Keamanan akun adalah prioritas kami. <br />
            Pastikan email yang Anda masukkan valid dan aktif.
          </p>
        </div>
      </div>
    </div>
  )
}