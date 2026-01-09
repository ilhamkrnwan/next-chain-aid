"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    platformName: "ChainAid",
    walletAddress: "0x7c8f9e3d4c2b1a5f9e3d4c2b1a5f7c8f9e3d4c2b",
    commissionRate: "2.5",
    minDonation: "10000",
    autoVerifyOrgs: true,
    requireProofImages: true,
    maxCampaignDuration: "90",
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan Platform</h1>
        <p className="text-muted-foreground mt-1">Kelola konfigurasi dan preferensi ChainAid</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
          <CardDescription>Konfigurasi dasar platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nama Platform</label>
            <Input name="platformName" value={formData.platformName} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Alamat Wallet Admin</label>
            <Input
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Wallet yang menerima komisi platform</p>
          </div>
        </CardContent>
      </Card>

      {/* Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Biaya</CardTitle>
          <CardDescription>Kelola komisi dan batasan transaksi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Komisi Platform (%)</label>
            <Input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleChange}
              step="0.1"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Persentase biaya yang diambil dari setiap transaksi</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Donasi Minimum (Rp)</label>
            <Input
              type="number"
              name="minDonation"
              value={formData.minDonation}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Jumlah donasi minimal yang diizinkan</p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Verifikasi</CardTitle>
          <CardDescription>Kelola proses verifikasi organisasi dan campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Auto-verify Organisasi</p>
              <p className="text-xs text-muted-foreground mt-1">Organisasi langsung disetujui jika memenuhi kriteria</p>
            </div>
            <input
              type="checkbox"
              name="autoVerifyOrgs"
              checked={formData.autoVerifyOrgs}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Wajibkan Bukti Distribusi</p>
              <p className="text-xs text-muted-foreground mt-1">Organisasi harus upload foto bukti penyaluran</p>
            </div>
            <input
              type="checkbox"
              name="requireProofImages"
              checked={formData.requireProofImages}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Campaign</CardTitle>
          <CardDescription>Kelola durasi dan batasan campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Durasi Campaign Maksimal (hari)</label>
            <Input
              type="number"
              name="maxCampaignDuration"
              value={formData.maxCampaignDuration}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Batas maksimal hari untuk sebuah campaign</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Zona Berbahaya
          </CardTitle>
          <CardDescription>Aksi yang tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="destructive" className="w-full">
            Reset Semua Pengaturan
          </Button>
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 bg-transparent">
            Pause Platform Sementara
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-6">
        {saved && <Badge className="bg-green-100 text-green-800">Perubahan berhasil disimpan</Badge>}
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  )
}
