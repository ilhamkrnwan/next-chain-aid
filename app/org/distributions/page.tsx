"use client"

import { DistributionList } from "@/components/org/distribution-list"

export default function DistributionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Penyaluran Dana</h1>
        <p className="text-muted-foreground mt-1">
          Salurkan dana dari campaign untuk kegiatan sosial
        </p>
      </div>

      <DistributionList />
    </div>
  )
}
