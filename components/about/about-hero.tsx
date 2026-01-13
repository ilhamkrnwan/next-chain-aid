"use client"

import { Code2, Terminal, Cpu } from "lucide-react"

export function AboutHero() {
  return (
    <section className="relative bg-yellow-400 py-20 sm:py-28 px-4 border-b-8 border-slate-900 overflow-hidden">
      {/* Background Pattern - Titik-titik Retro */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Terminal className="w-5 h-5 text-yellow-400" />
              <span className="font-black uppercase tracking-widest text-[10px]">Developer Manifest.v1</span>
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.85]">
              DI BALIK <br />
              <span className="bg-white px-4 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">LAYAR.</span>
            </h1>

            <p className="text-xl font-bold text-slate-800 uppercase italic leading-tight max-w-xl">
              Kami adalah kolektif pengembang dari Yogyakarta yang percaya bahwa teknologi Blockchain adalah kunci untuk transparansi sosial di masa depan.
            </p>
          </div>

          {/* Elemen Visual Keren */}
          <div className="hidden lg:flex justify-center relative">
             <div className="w-80 h-80 bg-blue-600 border-8 border-slate-900 rounded-[3rem] rotate-6 flex items-center justify-center shadow-[15px_15px_0px_0px_rgba(15,23,42,1)]">
                <Cpu className="w-40 h-40 text-white animate-pulse" />
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 border-8 border-slate-900 rounded-full -rotate-12 flex items-center justify-center text-white font-black text-4xl shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
                {`</>`}
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}