"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { uploadImage } from "@/lib/storage-helpers"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import type { Campaign } from "@/lib/types"

interface CampaignEditFormProps {
  campaignId: string
}

export function CampaignEditForm({ campaignId }: CampaignEditFormProps) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pendidikan",
    image_url: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const categories = [
    { value: "kesehatan", label: "Kesehatan" },
    { value: "pendidikan", label: "Pendidikan" },
    { value: "bencana_alam", label: "Bencana Alam" },
    { value: "lingkungan", label: "Lingkungan" },
    { value: "sosial", label: "Sosial" },
    { value: "ekonomi", label: "Ekonomi" },
  ]

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  async function fetchCampaign() {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error

      if (data) {
        setCampaign(data)
        setFormData({
          title: data.title,
          description: data.description || "",
          category: data.category,
          image_url: data.image_url || "",
        })
        setImagePreview(data.image_url || "")
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error("Gagal memuat data campaign")
    } finally {
      setLoading(false)
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("File harus berupa gambar")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!campaign) return

    try {
      setSaving(true)
      const supabase = createClient()

      let imageUrl = formData.image_url

      // Upload new image if selected
      if (imageFile) {
        setUploading(true)
        const uploaded = await uploadImage('campaigns', `campaigns/${campaignId}`, imageFile)
        imageUrl = uploaded.url
        setUploading(false)
      }

      // Update campaign
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: imageUrl,
        })
        .eq('id', campaignId)

      if (error) throw error

      toast.success("Campaign berhasil diupdate!")
      router.push(`/org/campaigns/${campaignId}`)
    } catch (error: any) {
      console.error('Error updating campaign:', error)
      toast.error(error.message || "Gagal update campaign")
    } finally {
      setSaving(false)
      setUploading(false)
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

  if (!campaign) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Campaign tidak ditemukan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Judul Campaign *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Judul campaign"
              required
              className="mt-2"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Kategori *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi campaign"
              rows={6}
              required
              className="mt-2"
            />
          </div>

          {/* Image */}
          <div>
            <Label>Gambar Campaign</Label>
            <div className="mt-2 space-y-4">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(formData.image_url)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Klik untuk upload gambar baru
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={saving || uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-medium">ℹ️ Informasi</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
              <li>Target amount dan durasi tidak bisa diubah (sudah di blockchain)</li>
              <li>Perubahan hanya untuk informasi di database</li>
              <li>Campaign status: {campaign.status}</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving || uploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Mengupload..." : "Menyimpan..."}
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
