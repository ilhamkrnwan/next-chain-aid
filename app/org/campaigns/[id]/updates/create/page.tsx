"use client"

import { CampaignUpdateForm } from "@/components/org/campaign-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function CreateCampaignUpdatePage() {
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
          <h1 className="text-3xl font-bold text-foreground">Post Campaign Update</h1>
          <p className="text-muted-foreground mt-1">
            Bagikan progress dan update campaign kepada donatur
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Update Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignUpdateForm campaignId={params.id as string} />
        </CardContent>
      </Card>
    </div>
  )
}
