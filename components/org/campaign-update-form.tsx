"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { uploadMultipleImages, validateMultipleImages, createImagePreview, revokeImagePreview } from "@/lib/storage-helpers"
import { postCampaignUpdate } from "@/lib/blockchain"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface CampaignUpdateFormProps {
  campaignId: string
}

export function CampaignUpdateForm({ campaignId }: CampaignUpdateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Validate
    const validation = validateMultipleImages([...selectedFiles, ...files], 5)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // Create previews
    const newPreviews = files.map(file => createImagePreview(file))
    
    setSelectedFiles(prev => [...prev, ...files])
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  function handleRemoveImage(index: number) {
    // Revoke preview URL
    revokeImagePreview(previewUrls[index])
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Judul dan konten harus diisi")
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Get campaign data
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('contract_address')
        .eq('id', campaignId)
        .single()

      if (!campaign?.contract_address) {
        toast.error("Campaign belum di-deploy ke blockchain")
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("User tidak terautentikasi")
        return
      }

      // Step 1: Upload images to storage (if any)
      let imageUrls: string[] = []
      if (selectedFiles.length > 0) {
        setUploading(true)
        toast.info("Mengupload gambar...")
        
        const uploadedImages = await uploadMultipleImages(
          'campaigns',
          `updates/${campaignId}`,
          selectedFiles
        )
        
        imageUrls = uploadedImages.map(img => img.url)
        setUploading(false)
      }

      // Step 2: Post update to blockchain
      toast.info("Memposting update ke blockchain...")
      await postCampaignUpdate(
        campaign.contract_address,
        formData.title,
        formData.content
      )

      // Step 3: Save to database
      const { data: updateData, error: updateError } = await supabase
        .from('campaign_updates')
        .insert({
          campaign_id: campaignId,
          title: formData.title,
          content: formData.content,
          created_by: user.id,
        })
        .select()
        .single()

      if (updateError) throw updateError

      // Step 4: Save images to database (if any)
      if (imageUrls.length > 0 && updateData) {
        const imageRecords = imageUrls.map((url, index) => ({
          campaign_update_id: updateData.id,
          image_url: url,
          display_order: index,
        }))

        const { error: imagesError } = await supabase
          .from('campaign_update_images')
          .insert(imageRecords)

        if (imagesError) throw imagesError
      }

      toast.success("Update berhasil diposting!")
      
      // Cleanup preview URLs
      previewUrls.forEach(url => revokeImagePreview(url))
      
      // Redirect back to campaign detail
      router.push(`/org/campaigns/${campaignId}`)
    } catch (error: any) {
      console.error('Error posting update:', error)
      toast.error(error.message || "Gagal memposting update")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Judul Update *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Contoh: Progress Pembangunan Sekolah Bulan Januari"
          required
          className="mt-2"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Konten Update *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Ceritakan progress campaign Anda secara detail..."
          rows={6}
          required
          className="mt-2"
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label>Gambar (Opsional, Max 5)</Label>
        <div className="mt-2 space-y-4">
          {/* Upload Button */}
          {selectedFiles.length < 5 && (
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP (Max 5MB per file)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
                disabled={loading || uploading}
              />
            </label>
          )}

          {/* Preview Images */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {selectedFiles.length} dari 5 gambar dipilih
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || uploading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading || uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploading ? "Mengupload gambar..." : "Memposting..."}
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Post Update
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
