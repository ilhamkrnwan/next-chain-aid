"use client"

import { OrgProfileForm } from "@/components/org/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrgProfilePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profil Organisasi</h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi dan profil organisasi Anda
        </p>
      </div>

      {/* Profile Form */}
      <OrgProfileForm />
    </div>
  )
}
