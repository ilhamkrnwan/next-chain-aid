"use client"

import { AboutHero } from "@/components/about/about-hero"
import { TeamSection } from "@/components/about/team-section"
import { Footer } from "@/components/sections/footer"

// PASTIKAN ADA "export default"
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <AboutHero />
      <TeamSection />
      <Footer />
    </main>
  )
}