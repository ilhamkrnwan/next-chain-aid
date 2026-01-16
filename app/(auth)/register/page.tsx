import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { Zap, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Daftar - ChainAid",
  description: "Buat akun ChainAid baru",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BACKGROUND DECOR - TITIK RETRO */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-md relative z-10">
        {/* LOGO & HEADER */}
        <div className="text-center mb-10">
          <Link href="/" className="group inline-block mb-6 relative">
            <div className="absolute inset-0 bg-yellow-400 border-4 border-slate-900 rounded-xl translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
            <div className="relative bg-blue-600 text-white border-4 border-slate-900 px-6 py-2 rounded-xl flex items-center gap-2">
              <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">ChainAid</h1>
            </div>
          </Link>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              DAFTAR <span className="text-blue-600">AKUN.</span>
            </h2>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">
              Platform Donasi Transparan On-Chain
            </p>
          </div>
        </div>

        {/* REGISTER CARD */}
        <div className="relative group">
          {/* SHADOW BOX */}
          <div className="absolute inset-0 bg-slate-900 border-4 border-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
          
          {/* MAIN CARD */}
          <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-8 sm:p-10">
            {/* FLOATING DECOR */}
            <div className="absolute -top-5 -right-5 bg-pink-500 border-4 border-slate-900 p-2 rounded-xl rotate-12 hidden sm:block">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <RegisterForm />

            {/* DIVIDER NEO-BRUTAL */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-slate-900 border-dashed"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs font-black uppercase tracking-[0.3em] text-slate-900">Atau</span>
              </div>
            </div>

            {/* LOGIN LINK */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600 uppercase italic">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-600 underline decoration-yellow-400 decoration-4 underline-offset-4 hover:bg-blue-600 hover:text-white transition-all">
                  MASUK DISINI
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER LINKS */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
            Dengan mendaftar, Anda menyetujui <br />
            <Link href="/terms" className="text-slate-900 hover:text-blue-600 underline decoration-2">Syarat &amp; Ketentuan</Link> 
            {" "}&amp;{" "}
            <Link href="/privacy" className="text-slate-900 hover:text-blue-600 underline decoration-2">Kebijakan Privasi</Link>
          </p>
        </div>
      </div>
    </div>
  )
}