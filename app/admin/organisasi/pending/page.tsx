import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganisasiFilter } from "@/components/admin/organisasi-filter"

const pendingOrganizations = [
  {
    id: 5,
    name: "Gerakan Pendidikan Masa Depan",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=org5",
    admin: "Rahman Hidayat",
    campaigns: 0,
    donations: "Rp 0",
    status: "pending" as const,
  },
  {
    id: 6,
    name: "Komunitas Kesehatan Lokal",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=org6",
    admin: "Dr. Suwardi",
    campaigns: 0,
    donations: "Rp 0",
    status: "pending" as const,
  },
  {
    id: 7,
    name: "Yayasan Pemberdayaan Perempuan",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=org7",
    admin: "Fitri Wijaya",
    campaigns: 0,
    donations: "Rp 0",
    status: "pending" as const,
  },
]

const statusBadgeConfig = {
  approved: { label: "Disetujui", className: "bg-green-100 text-green-800" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  banned: { label: "Dilarang", className: "bg-red-100 text-red-800" },
}

export default function PendingOrganisasiPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organisasi Menunggu Persetujuan</h1>
        <p className="text-muted-foreground mt-1">Review dan setujui pendaftaran organisasi baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Organisasi Pending ({pendingOrganizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganisasiFilter organizations={pendingOrganizations} statusBadgeConfig={statusBadgeConfig} />
        </CardContent>
      </Card>
    </div>
  )
}
