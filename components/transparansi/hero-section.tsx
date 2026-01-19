"use client"

import { ShieldCheck, Zap } from "lucide-react"

export function TransparencyHero() {
  return (
    <section className="relative bg-blue-600 py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-8 border-slate-900">
      {/* ELEMEN DEKORATIF LATAR BELAKANG */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 border-[40px] border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 border-[20px] border-white rotate-45" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* LABEL VERIFIKASI */}
          <div className="bg-yellow-400 border-4 border-slate-900 px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-900 stroke-[2.5px]" />
              <span className="font-black uppercase tracking-widest text-[11px] text-slate-900">
                Transparansi Blockchain Terverifikasi
              </span>
            </div>
          </div>

          {/* JUDUL UTAMA */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.95] drop-shadow-[6px_6px_0px_rgba(15,23,42,1)]">
              AKUNTABILITAS <br />
              <span className="text-yellow-400 underline decoration-8 decoration-slate-900 underline-offset-8">TANPA BATAS.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-50 font-bold uppercase tracking-tight max-w-3xl mx-auto leading-relaxed pt-4">
              Komitmen kami adalah menyajikan data yang akurat dan kredibel. Pantau arus distribusi dana donasi secara langsung melalui sistem mutakhir berbasis Ethereum.
            </p>
          </div>

          {/* ELEMEN PEMISAH */}
          <div className="flex items-center gap-4 pt-4">
            <div className="w-16 h-2 bg-slate-900 rounded-full" />
            <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <div className="w-16 h-2 bg-slate-900 rounded-full" />
          </div>
        </div>
      </div>

      {/* LABEL VALIDASI SUDUT */}
      <div className="absolute bottom-6 right-6 hidden md:block">
        <div className="bg-white border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3">
          <p className="font-black uppercase text-[10px] text-blue-600 leading-none mb-1">Audit Digital Oleh</p>
          <p className="font-black uppercase text-xl text-slate-900 leading-none">Ethereum Network</p>
        </div>
      </div>
    </section>
  )
}