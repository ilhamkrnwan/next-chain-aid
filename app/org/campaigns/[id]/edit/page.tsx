"use client"

import { CampaignEditForm } from "@/components/org/campaign-edit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditCampaignPage() {
  const params = useParams()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/org/campaigns/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Update informasi campaign Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <CampaignEditForm campaignId={params.id as string} />
    </div>
  )
}
