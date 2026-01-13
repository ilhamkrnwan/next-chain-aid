"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createOrganization, uploadFile, getCurrentProfile } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Building2, 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function RegisterOrgPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    website: "",
  })

  const [files, setFiles] = useState<{
    ktp: File | null
    legalDoc: File | null
  }>({
    ktp: null,
    legalDoc: null,
  })

  const [uploadProgress, setUploadProgress] = useState({
    ktp: false,
    legalDoc: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'legalDoc') => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${type === 'ktp' ? 'KTP' : 'Dokumen Legal'} terlalu besar. Maksimal 5MB`)
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError(`Format file ${type === 'ktp' ? 'KTP' : 'Dokumen Legal'} tidak valid. Gunakan JPG, PNG, atau PDF`)
        return
      }

      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }))
      setError("")
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nama organisasi harus diisi")
      return false
    }
    if (!formData.description.trim()) {
      setError("Deskripsi organisasi harus diisi")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Nomor telepon harus diisi")
      return false
    }
    if (!files.ktp) {
      setError("Foto KTP harus diupload")
      return false
    }
    if (!files.legalDoc) {
      setError("Dokumen legal harus diupload")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has organization
      const profile = await getCurrentProfile()
      if (!profile) {
        throw new Error("Profile not found")
      }

      // Upload KTP
      setUploadProgress((prev) => ({ ...prev, ktp: true }))
      const ktpPath = `ktp/${user.id}-${Date.now()}.${files.ktp!.name.split('.').pop()}`
      const ktpUrl = await uploadFile('documents', ktpPath, files.ktp!)
      
      // Upload Legal Document
      setUploadProgress((prev) => ({ ...prev, legalDoc: true }))
      const legalDocPath = `legal/${user.id}-${Date.now()}.${files.legalDoc!.name.split('.').pop()}`
      const legalDocUrl = await uploadFile('documents', legalDocPath, files.legalDoc!)

      // Create organization
      await createOrganization({
        id: user.id,
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        address: formData.address || null,
        website: formData.website || null,
        ktp_url: ktpUrl,
        legal_doc_url: legalDocUrl,
        status: 'pending',
        is_verified: false,
      })

      // Update user role to 'org'
      await supabase
        .from('profiles')
        .update({ role: 'org' })
        .eq('id', user.id)

      setSuccess(true)
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (error: any) {
      console.error('Error registering organization:', error)
      setError(error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.")
    } finally {
      setLoading(false)
      setUploadProgress({ ktp: false, legalDoc: false })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Pendaftaran Berhasil!</h3>
            <p className="text-slate-600">
              Pendaftaran organisasi Anda telah diterima dan sedang dalam proses verifikasi.
            </p>
            <p className="text-sm text-slate-500">
              Anda akan diarahkan ke halaman profile...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link 
            href="/profile" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Daftar sebagai Organisasi</h1>
              <p className="text-slate-600 mt-1">Lengkapi formulir di bawah untuk mendaftar</p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Persyaratan Pendaftaran:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                <li>Foto KTP pengurus organisasi</li>
                <li>Dokumen legal organisasi (Akta Pendirian/SK/Surat Keterangan)</li>
                <li>Informasi organisasi yang lengkap dan valid</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Organisasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Nama Organisasi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Yayasan Pendidikan Indonesia"
                  required
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">
                  Deskripsi Organisasi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan visi, misi, dan kegiatan organisasi Anda..."
                  rows={4}
                  required
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+62 812-3456-7890"
                    required
                    disabled={loading}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website (Opsional)</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.org"
                    disabled={loading}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Jl. Contoh No. 123, Jakarta"
                  disabled={loading}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* KTP Upload */}
              <div>
                <Label htmlFor="ktp">
                  Foto KTP Pengurus <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <label
                    htmlFor="ktp"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadProgress.ktp ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      ) : files.ktp ? (
                        <FileText className="w-8 h-8 text-green-600 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      )}
                      <p className="text-sm text-slate-600">
                        {files.ktp ? files.ktp.name : "Klik untuk upload KTP"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                    <input
                      id="ktp"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileChange(e, 'ktp')}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>

              {/* Legal Document Upload */}
              <div>
                <Label htmlFor="legalDoc">
                  Dokumen Legal Organisasi <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <label
                    htmlFor="legalDoc"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadProgress.legalDoc ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      ) : files.legalDoc ? (
                        <FileText className="w-8 h-8 text-green-600 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      )}
                      <p className="text-sm text-slate-600">
                        {files.legalDoc ? files.legalDoc.name : "Klik untuk upload dokumen"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                    <input
                      id="legalDoc"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileChange(e, 'legalDoc')}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/profile')}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Daftar Sekarang
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
