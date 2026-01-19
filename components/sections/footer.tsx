"use client"

import { Instagram, Twitter, Linkedin, ShieldCheck, Zap, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t-8 border-blue-600 overflow-hidden">
      {/* DEKORASI BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        
        {/* KONTEN UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* IDENTITAS BRAND */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 bg-white px-4 py-2 border-4 border-blue-600 rounded-xl shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">ChainAid</h3>
            </Link>
            <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase italic">
              Platform filantropi berbasis blockchain. Menjamin akuntabilitas dan transparansi setiap donasi secara real-time melalui teknologi on-chain.
            </p>
          </div>

          {/* NAVIGASI - SINKRON DENGAN NAVBAR */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-blue-400 uppercase tracking-widest italic border-l-4 border-blue-600 pl-3">Navigasi Utama</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  <Zap className="w-3 h-3 text-blue-600 group-hover:fill-blue-600 transition-all" /> Beranda
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  <Zap className="w-3 h-3 text-blue-600 group-hover:fill-blue-600 transition-all" /> Donasi
                </Link>
              </li>
              <li>
                <Link href="/transparansi" className="text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  <Zap className="w-3 h-3 text-blue-600 group-hover:fill-blue-600 transition-all" /> Transparansi
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  <Zap className="w-3 h-3 text-blue-600 group-hover:fill-blue-600 transition-all" /> Tentang
                </Link>
              </li>
            </ul>
          </div>

          {/* LOKASI & KONTAK - YOGYAKARTA */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-yellow-400 uppercase tracking-widest italic border-l-4 border-yellow-400 pl-3">Markas Besar</h4>
            <ul className="space-y-3 font-bold text-xs uppercase tracking-widest text-slate-300 italic">
              <li className="flex items-start gap-3 leading-tight">
                <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Yogyakarta, <br />Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>kontak@chainaid.id</span>
              </li>
            </ul>
          </div>

          {/* MEDIA SOSIAL */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-pink-500 uppercase tracking-widest italic border-l-4 border-pink-500 pl-3">Kanal Sosial</h4>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com/chainaid" },
                { Icon: Twitter, href: "https://twitter.com/chainaid" },
                { Icon: Linkedin, href: "https://linkedin.com/company/chainaid" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 border-2 border-slate-700 flex items-center justify-center rounded-lg transition-all hover:bg-white hover:text-slate-900 hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-10 border-t-2 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 border-2 border-slate-900 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 text-slate-900 fill-current" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              © {year} ChainAid Team. Yogyakarta Pride.
            </p>
          </div>
          
          <div className="bg-slate-900 border-2 border-slate-700 px-5 py-2 rounded-full flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Network Status: <span className="text-white">Sepolia Node Active</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}