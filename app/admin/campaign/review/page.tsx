"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, CheckCircle, XCircle, Eye } from "lucide-react"
import Image from "next/image"

const campaignNeedingReview = [
  {
    id: 3,
    title: "Kesehatan Ibu dan Anak di Desa Terpencil",
    organization: "Klinik Kesehatan Masyarakat",
    image: "/healthcare-abstract.png",
    target: "Rp 100M",
    collected: "Rp 65.8M",
    donors: 892,
    status: "review",
    reason: "Verifikasi organisasi pending",
  },
  {
    id: 4,
    title: "Program Rehabilitasi Anak Jalanan",
    organization: "Rumah Harapan Anak",
    image: "/diverse-students-learning.png",
    target: "Rp 250M",
    collected: "Rp 125M",
    donors: 1204,
    status: "review",
    reason: "Target beneficiary tidak sesuai dokumen",
  },
]

export default function CampaignReviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campaign Perlu Review</h1>
        <p className="text-muted-foreground mt-1">Review campaign yang memerlukan perhatian khusus</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Menunggu Review ({campaignNeedingReview.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Campaign</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Organisasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Target/Terkumpul</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Alasan Review</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {campaignNeedingReview.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={campaign.image || "/placeholder.svg"}
                          alt={campaign.title}
                          width={40}
                          height={40}
                          className="rounded w-10 h-10 object-cover"
                        />
                        <span className="font-medium text-sm max-w-xs truncate">{campaign.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{campaign.organization}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-semibold text-foreground">{campaign.collected}</div>
                        <div className="text-xs text-muted-foreground">dari {campaign.target}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground max-w-xs">
                      <Badge variant="outline">{campaign.reason}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>Setujui Campaign</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            <span>Tolak Campaign</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
