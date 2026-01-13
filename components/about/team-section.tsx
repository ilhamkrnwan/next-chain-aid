"use client"

import { Github, Linkedin, Globe, Code2 } from "lucide-react"
import Image from "next/image"

const TEAM_MEMBERS = [
  {
    name: "Developer Utama",
    role: "Fullstack & Smart Contract",
    description: "Spesialis dalam arsitektur Ethereum dan integrasi Web3.",
    image: "/team/dev1.jpg", // Ganti dengan path foto tim kamu
    skills: ["Solidity", "Next.js", "TypeScript"],
    socials: { github: "#", linkedin: "#", web: "#" }
  },
  // Tambahkan anggota tim lain di sini
]

export function TeamSection() {
  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-slate-900 pb-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              ENGINEERING <span className="text-blue-600">TEAM</span>
            </h2>
            <p className="font-bold text-slate-500 uppercase tracking-widest text-sm italic">
              Yogyakarta Digital Artisan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="group relative">
              {/* Bayangan Belakang */}
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3 group-hover:translate-x-5 group-hover:translate-y-5 transition-all" />
              
              {/* Card Utama */}
              <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 space-y-6 overflow-hidden">
                {/* Profile Placeholder (Bisa diganti <Image />) */}
                <div className="w-full h-64 bg-slate-100 border-4 border-slate-900 rounded-[2rem] flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                  <Code2 className="w-20 h-20 text-slate-300" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{member.name}</h3>
                  <p className="text-blue-600 font-black uppercase text-xs tracking-widest italic">{member.role}</p>
                </div>

                <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-t-2 border-dashed border-slate-100 pt-4">
                  "{member.description}"
                </p>

                {/* Tags Skill */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {member.skills.map(skill => (
                    <span key={skill} className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Social Buttons */}
                <div className="flex gap-3 pt-4">
                  <a href={member.socials.github} className="p-3 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-yellow-400 transition-colors">
                    <Github className="w-5 h-5 text-slate-900" />
                  </a>
                  <a href={member.socials.linkedin} className="p-3 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-blue-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}