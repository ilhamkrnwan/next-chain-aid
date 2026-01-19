"use client"

import { CheckCircle, Gift, Lock, Eye, ArrowRight, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "PILIH KAMPANYE",
    description: "Temukan program kemanusiaan yang ingin Anda bantu. Seluruh data terverifikasi!",
    icon: Gift,
    accentColor: "bg-blue-500",
  },
  {
    number: "02",
    title: "KONEKSI DOMPET",
    description: "Donasi menggunakan Aset Kripto. Aman, cepat, dan tanpa perantara pihak ketiga.",
    icon: CheckCircle,
    accentColor: "bg-yellow-400",
  },
  {
    number: "03",
    title: "CATATAN ON-CHAIN",
    description: "Setiap transaksi Anda dicatat secara permanen dan abadi di Blockchain Sepolia.",
    icon: Lock,
    accentColor: "bg-pink-500",
  },
  {
    number: "04",
    title: "PANTAU REAL-TIME",
    description: "Lihat transparansi penyaluran dana secara terbuka dan langsung di jaringan.",
    icon: Eye,
    accentColor: "bg-green-500",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* LATAR BELAKANG DEKORATIF */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent 100%)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-7xl mx-auto space-y-20">
        
        {/* HEADER SEKSI */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white border-4 border-slate-900 rounded-full shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] rotate-1">
            <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Proses Transparan</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            CARA <span className="text-blue-600 not-italic">KERJA.</span>
          </h2>
          <p className="text-xl font-bold text-slate-500 max-w-2xl uppercase italic tracking-tight">
            Empat langkah sederhana untuk menjadi bagian dari perubahan yang transparan dan bebas dari penyalahgunaan.
          </p>
        </div>

        {/* GRID LANGKAH-LANGKAH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          
          {/* PANAH DEKORATIF (Hanya Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none">
             <div className="flex justify-around px-20">
                {[1, 2, 3].map((i) => (
                  <ArrowRight key={i} className="w-12 h-12 text-slate-200 stroke-[4px]" />
                ))}
             </div>
          </div>

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="group relative">
                {/* LAPISAN BELAKANG (BAYANGAN) */}
                <div className={`absolute inset-0 ${step.accentColor} border-4 border-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300`} />
                
                {/* LAPISAN DEPAN (KONTEN) */}
                <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 h-full flex flex-col items-center text-center space-y-6 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                  
                  {/* NOMOR URUT */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white border-4 border-slate-900 w-14 h-14 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xl font-black text-slate-900 italic">{step.number}</span>
                  </div>

                  {/* KOTAK IKON */}
                  <div className={`w-20 h-20 ${step.accentColor} border-4 border-slate-900 rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] group-hover:rotate-12 transition-transform duration-500`}>
                    <Icon className="w-10 h-10 text-white stroke-[3px]" />
                  </div>

                  {/* TEKS PENJELASAN */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
                      {step.title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 leading-snug uppercase tracking-tight">
                      {step.description}
                    </p>
                  </div>

                  {/* ELEMEN DEKORATIF BAWAH */}
                  <div className="pt-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <div className="h-1.5 w-12 bg-slate-900 rounded-full" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}