"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles, Zap, ShieldCheck, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative bg-white min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
      {/* BACKGROUND DECOR (RETRO DOTS) */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div className="space-y-10 text-center lg:text-left order-2 lg:order-1">
          {/* BADGE NEO-BRUTAL */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-400 border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 group hover:rotate-0 transition-transform cursor-default">
            <Sparkles className="w-5 h-5 text-slate-900 fill-current" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">
              BLOCKCHAIN DONATION v1.0
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase italic">
              BANTU <span className="text-blue-600 not-italic">SESAMA</span> <br />
              DENGAN <span className="underline decoration-yellow-400 decoration-8 underline-offset-8">TRANSPARAN.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 font-bold max-w-2xl mx-auto lg:mx-0 leading-tight uppercase italic">
              Setiap Rupiah tercatat abadi di Sepolia Testnet. <br />
              Bukan cuma janji, tapi bukti real-time on-chain!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
            <Link href="/campaigns">
              <Button
                size="lg"
                className="h-20 px-10 rounded-2xl bg-blue-600 text-white border-4 border-slate-900 text-xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Mulai Berdonasi
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="h-20 px-10 rounded-2xl bg-white border-4 border-slate-900 text-slate-900 text-xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
              >
                Cek Campaign
                <ChevronRight className="w-6 h-6 stroke-[3px]" />
              </Button>
            </Link>
          </div>

          {/* MINI STATS / TRUST BADGE */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6 opacity-80">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">
              <ShieldCheck className="w-5 h-5 text-green-500" /> Fully Secured
            </div>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">
              <Zap className="w-5 h-5 text-yellow-500 fill-current" /> Instant Settlement
            </div>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tighter">
              <Globe className="w-5 h-5 text-blue-500" /> Decentralized
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center">
          {/* BACKGROUND SHAPE */}
          <div className="absolute w-[80%] h-[80%] bg-blue-100 border-4 border-slate-900 rounded-[4rem] rotate-3 -z-10" />
          
          <div className="relative w-full max-w-[500px] aspect-square group">
            {/* MAIN IMAGE CARD */}
            <div className="absolute inset-0 bg-white border-4 border-slate-900 rounded-[3rem] overflow-hidden shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] group-hover:shadow-none group-hover:translate-x-4 group-hover:translate-y-4 transition-all duration-500">
              <Image 
                src="http://googleusercontent.com/image_collection/image_retrieval/723434977496810484_0" 
                alt="Blockchain Charity" 
                fill 
                className="object-cover"
              />
            </div>

            {/* FLOATING CARD 1 */}
            <div className="absolute -top-6 -right-6 bg-white border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-400 border-2 border-slate-900 rounded-lg flex items-center justify-center font-black">
                  ₿
                </div>
                <div className="text-[10px] font-black leading-none uppercase">
                  New Donation <br />
                  <span className="text-blue-600">0.52 ETH</span>
                </div>
              </div>
            </div>

            {/* FLOATING CARD 2 */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900 border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="w-6 h-6 text-yellow-400" />
                <div className="text-[10px] font-black leading-none uppercase">
                  Verified <br />
                  <span className="text-green-400">On-Chain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}