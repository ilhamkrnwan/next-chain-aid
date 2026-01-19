"use client"

import { Github, Linkedin, Code2, PenTool, Layout, Terminal, Briefcase, Zap, ArrowUpRight } from "lucide-react"
import Image from "next/image"

const TEAM_MEMBERS = [
  {
    realName: "Lilis Fatimatul Zahro", 
    role: "Project Manager",
    description: "Orkestrator utama yang memastikan visi desentralisasi ChainAid tetap pada jalurnya.",
    image: "/team/pm.webp",
    skills: ["Management", "Agile", "Strategy"],
    color: "bg-yellow-400",
    socials: { github: "#", linkedin: "#" }
  },
  {
    realName: "Fauzan Arisanto", 
    role: "Smart Contract & Front-End",
    description: "Penyihir Solidity dan React yang membangun jembatan antara user dan blockchain.",
    image: "/team/web3.webp",
    skills: ["Solidity", "Next.js", "Ethers.js"],
    color: "bg-blue-600",
    socials: { github: "#", linkedin: "#" }
  },
  {
    realName: "Ilham Kurniawan", 
    role: "Back-End & Python Engineer",
    description: "Spesialis infrastruktur data dan otomasi cerdas menggunakan Python.",
    image: "/team/backend.webp",
    skills: ["Python", "FastAPI", "PostgreSQL"],
    color: "bg-green-400",
    socials: { github: "#", linkedin: "#" }
  },
  {
    realName: "Muhammad Ikhsan", 
    role: "UI/UX Designer",
    description: "Arsitek di balik estetika Neo-Brutalism yang gahar dan intuitif.",
    image: "/team/ui.webp",
    skills: ["Figma", "Brutalist UI", "UX Research"],
    color: "bg-pink-500",
    socials: { github: "#", linkedin: "#" }
  },
  {
    realName: "M. Ngaqilun Nafi", 
    role: "Technical Documentation",
    description: "Penjaga akurasi laporan teknis dan dokumentasi proyek standar global.",
    image: "/team/doc.webp",
    skills: ["Tech Writing", "Reports", "Compliance"],
    color: "bg-purple-500",
    socials: { github: "#", linkedin: "#" }
  },
]

export function TeamSection() {
  return (
    <section className="py-24 bg-white px-4 border-t-8 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-8 border-slate-900">
          <div className="lg:col-span-7 p-8 lg:p-12 space-y-6 lg:border-r-8 lg:border-slate-900">
            <div className="inline-flex items-center gap-2 bg-pink-500 text-white border-4 border-slate-900 px-4 py-1 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase italic tracking-widest">
              <Zap className="w-4 h-4 fill-white" /> Meet The Artisans
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.85]">
              ENGINEERING <br /> <span className="text-blue-600">TEAM.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 p-8 lg:p-12 bg-slate-50 flex flex-col justify-end space-y-4">
             <p className="font-black text-slate-900 uppercase italic tracking-widest text-xl">
               Yogyakarta Digital Artisan
             </p>
             <p className="font-bold text-slate-500 leading-relaxed uppercase text-sm italic">
               Kami adalah tim pengembang dari UNU Yogyakarta yang berfokus pada solusi desentralisasi yang transparan dan berdampak sosial.
             </p>
          </div>
        </div>

        {/* TEAM GRID SYSTEM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className={`group border-b-8 border-slate-900 flex flex-col transition-all hover:bg-slate-50
              ${(idx + 1) % 3 !== 0 ? 'lg:border-r-8' : ''} 
              ${(idx + 1) % 2 !== 0 ? 'md:border-r-8 lg:md:border-r-8' : 'md:border-r-0 lg:border-r-8'}
              ${idx === 4 ? 'lg:border-r-8' : ''} 
            `}>
              
              {/* Image Section */}
              <div className="p-8">
                <div className="relative w-full h-80 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all overflow-hidden bg-slate-200">
                  <Image 
                    src={member.image} 
                    alt={member.realName}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className={`absolute bottom-0 left-0 right-0 h-2 ${member.color} border-t-4 border-slate-900`} />
                </div>
              </div>

              {/* Info Section */}
              <div className="p-8 pt-0 flex-grow space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                    {member.realName}
                  </h3>
                  <p className={`inline-block px-2 py-0.5 border-2 border-slate-900 ${member.color} text-[10px] font-black uppercase italic`}>
                    {member.role}
                  </p>
                </div>
                
                <p className="text-sm font-bold text-slate-600 leading-tight italic">
                  "{member.description}"
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map(skill => (
                    <span key={skill} className="text-[9px] font-black uppercase border border-slate-900 px-2 py-0.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Card/Socials */}
              <div className="p-8 pt-0 flex gap-2">
                <a href={member.socials.github} className="flex-1 py-2 border-4 border-slate-900 flex justify-center items-center hover:bg-slate-900 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href={member.socials.linkedin} className="flex-1 py-2 border-4 border-slate-900 flex justify-center items-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}

          {/* EMPTY BOX TO COMPLETE GRID (Optional) */}
          <div className="hidden lg:flex border-b-8 border-slate-900 p-8 items-center justify-center bg-slate-900 text-white group cursor-pointer overflow-hidden relative">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
             <div className="text-center z-10">
                <p className="text-4xl font-black italic tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">AYO BANGUN <br /> TRANSPARANSI!</p>
                <ArrowUpRight className="w-12 h-12 mx-auto mt-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
             </div>
          </div>
        </div>

      </div>
    </section>
  )
}