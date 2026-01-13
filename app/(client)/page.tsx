import { Hero } from "@/components/sections/hero"
import { Stats } from "@/components/sections/stats"
import { FeaturedCampaigns } from "@/components/sections/featured-campaigns"
import { HowItWorks } from "@/components/sections/how-it-works"
import { WhyChainAid } from "@/components/sections/why-chainaid"
import { Footer } from "@/components/sections/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Stats />
      <FeaturedCampaigns />
      <HowItWorks />
      <WhyChainAid />
      <Footer />
    </main>
  )
}
