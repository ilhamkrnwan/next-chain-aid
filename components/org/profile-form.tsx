"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { CheckCircle, Upload, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { uploadImage } from "@/lib/storage-helpers"
import { toast } from "sonner"
import type { Organization } from "@/lib/types"

export function OrgProfileForm() {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    website: "",
    image_url: "",
  })

  useEffect(() => {
    fetchOrganizationData()
  }, [])

  async function fetchOrganizationData() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id)
        .single()

      if (orgData) {
        setOrganization(orgData)
        setFormData({
          name: orgData.name || "",
          description: orgData.description || "",
          phone: orgData.phone || "",
          address: orgData.address || "",
          website: orgData.website || "",
          image_url: orgData.image_url || "",
        })
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
      toast.error("Gagal memuat data organisasi")
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Upload to Supabase Storage
      const uploadedImage = await uploadImage('avatars', 'organizations', file)
      
      setFormData(prev => ({ ...prev, image_url: uploadedImage.url }))
      toast.success("Logo berhasil diupload")
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || "Gagal upload logo")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!organization) return

    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          image_url: formData.image_url,
        })
        .eq('id', organization.id)

      if (error) throw error

      toast.success("Profil berhasil diperbarui!")
      router.refresh()
    } catch (error: any) {
      console.error('Error updating organization:', error)
      toast.error(error.message || "Gagal memperbarui profil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Data organisasi tidak ditemukan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = () => {
    switch (organization.status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terverifikasi
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Menunggu Verifikasi
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Ditolak
          </Badge>
        )
    }
  }

  return (
    <>
      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Organisasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo & Status */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.image_url || ""} alt={formData.name} />
                  <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{formData.name}</h3>
                {getStatusBadge()}
                <p className="text-sm text-muted-foreground">
                  {organization.status === 'approved' && "Organisasi yang telah diverifikasi oleh ChainAid"}
                  {organization.status === 'pending' && "Organisasi Anda sedang dalam proses verifikasi"}
                  {organization.status === 'rejected' && organization.rejection_reason}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Organisasi *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Admin</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    readOnly
                    className="mt-2 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email tidak dapat diubah
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+62 812-3456-7890"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi Organisasi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Deskripsikan organisasi Anda..."
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Jl. Contoh No. 123, Jakarta"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.org"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Wallet Address Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Ethereum Wallet Address</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {profile?.wallet_address || "Belum terhubung"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Wallet ini digunakan untuk menerima donasi dan penyaluran dana
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
