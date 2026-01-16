import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Zap, KeyRound } from "lucide-react"

export const metadata: Metadata = {
  title: "Login - ChainAid",
  description: "Login ke akun ChainAid Anda",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* BACKGROUND DECOR - RETRO GRID */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-md relative z-10">
        {/* LOGO & HEADER */}
        <div className="text-center mb-10">
          <Link href="/" className="group inline-block mb-6 relative">
            <div className="absolute inset-0 bg-blue-600 border-4 border-slate-900 rounded-xl translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
            <div className="relative bg-yellow-400 text-slate-900 border-4 border-slate-900 px-6 py-2 rounded-xl flex items-center gap-2">
              <Zap className="w-5 h-5 fill-slate-900 text-slate-900" />
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">ChainAid</h1>
            </div>
          </Link>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              WELCOME <span className="text-blue-600">BACK.</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
              Masuk & Pantau Donasi On-Chain Anda
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="relative group">
          {/* SHADOW BOX */}
          <div className="absolute inset-0 bg-blue-600 border-4 border-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3"></div>
          
          {/* MAIN CARD */}
          <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 sm:p-10">
            {/* FLOATING ICON DECOR */}
            <div className="absolute -top-6 -left-6 bg-purple-500 border-4 border-slate-900 p-3 rounded-2xl -rotate-12 hidden sm:block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <KeyRound className="w-6 h-6 text-white" />
            </div>

            <LoginForm />

            {/* DIVIDER NEO-BRUTAL */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-slate-900 border-dashed"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs font-black uppercase tracking-[0.3em] text-slate-900 italic">Security Check</span>
              </div>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center space-y-4">
              <p className="text-sm font-bold text-slate-600 uppercase italic">
                Belum punya akun?{" "}
                <Link href="/register" className="text-pink-600 underline decoration-blue-600 decoration-4 underline-offset-4 hover:bg-pink-600 hover:text-white transition-all px-1">
                  DAFTAR SEKARANG
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="mt-8 text-center">
          <Link href="/forgot-password" 
            className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600">
            Lupa Password? Klik Disini 
          </Link>
        </div>
      </div>
    </div>
  )
}