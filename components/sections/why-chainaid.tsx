"use client"

import { Shield, Zap, Lock, TrendingUp, Star } from "lucide-react"

const features = [
  {
    title: "TRANSPARANSI PENUH",
    description: "Setiap transaksi dapat diverifikasi dan dilacak oleh siapa pun di jaringan blockchain.",
    icon: TrendingUp,
    accentColor: "bg-blue-500",
  },
  {
    title: "KEAMANAN BLOCKCHAIN",
    description: "Teknologi terdesentralisasi memastikan data aman dan tidak dapat dimanipulasi.",
    icon: Lock,
    accentColor: "bg-purple-500",
  },
  {
    title: "MUDAH & AMAN",
    description: "Antarmuka yang intuitif dengan sistem keamanan tingkat tinggi untuk aset Anda.",
    icon: Shield,
    accentColor: "bg-green-500",
  },
  {
    title: "LACAK REAL-TIME",
    description: "Pantau penggunaan dana secara langsung tanpa ada yang ditutup-tutupi.",
    icon: Zap,
    accentColor: "bg-yellow-400",
  },
]

export function WhyChainAid() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ELEMEN DEKORATIF – Garis Kisi (Grid) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        
        {/* HEADER SEKSI */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400 border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
            <Star className="w-5 h-5 text-slate-900 fill-current" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Keunggulan Utama</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            KENAPA <span className="text-blue-600 not-italic">CHAINAID?</span>
          </h2>
          <p className="text-xl font-bold text-slate-500 max-w-2xl uppercase italic tracking-tight">
            Platform donasi masa depan yang menggabungkan kepercayaan mutlak dengan teknologi mutakhir.
          </p>
        </div>

        {/* GRID FITUR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative cursor-pointer"
              >
                {/* LAPISAN BAYANGAN (SHADOW BOX) */}
                <div className="absolute inset-0 bg-slate-900 border-4 border-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                
                {/* KARTU UTAMA */}
                <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 h-full flex flex-col space-y-6 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                  
                  {/* IKON DENGAN BACKGROUND AKSEN */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-slate-900 ${feature.accentColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white stroke-[3px]" />
                  </div>

                  {/* KONTEN TEKS */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                      {feature.description}
                    </p>
                  </div>

                  {/* DEKORASI SUDUT */}
                  <div className={`absolute bottom-6 right-8 w-8 h-8 ${feature.accentColor} opacity-20 rounded-full blur-xl group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* FOOTER SEKSI (CTA KECIL) */}
        <div className="pt-12 flex justify-center">
          <div className="p-10 border-4 border-dashed border-slate-300 rounded-[3rem] text-center max-w-3xl w-full">
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
              Siap untuk membuat dampak nyata?
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}