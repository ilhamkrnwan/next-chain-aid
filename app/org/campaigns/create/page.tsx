"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { createClient } from "@/lib/supabase/client"
import { createCampaign, uploadFile, getCurrentProfile } from "@/lib/api"
import { createBlockchainCampaign } from "@/lib/blockchain"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Wallet,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const STEPS = [
  { id: 1, name: "Informasi Dasar", description: "Detail campaign" },
  { id: 2, name: "Deskripsi & Gambar", description: "Konten campaign" },
  { id: 3, name: "Review & Deploy", description: "Konfirmasi & blockchain" },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deployStatus, setDeployStatus] = useState<{
    uploading?: boolean
    deploying?: boolean
    saving?: boolean
    success?: boolean
  }>({})

  const [formData, setFormData] = useState({
    title: "",
    category: "pendidikan",
    targetAmount: "",
    durationDays: "30",
    description: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("File harus berupa gambar")
        return
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError("")
    }
  }

  const validateStep = (step: number) => {
    setError("")

    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Judul campaign harus diisi")
        return false
      }
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        setError("Target donasi harus lebih dari 0")
        return false
      }
      if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
        setError("Durasi campaign harus lebih dari 0 hari")
        return false
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        setError("Deskripsi campaign harus diisi")
        return false
      }
      if (!imageFile) {
        setError("Gambar campaign harus diupload")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    // Check wallet connection
    if (!isConnected || !address) {
      setError("Silakan connect wallet terlebih dahulu")
      return
    }

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Step 1: Upload image
      setDeployStatus({ uploading: true })
      const imagePath = `campaigns/${user.id}-${Date.now()}.${imageFile!.name.split('.').pop()}`
      const imageUrl = await uploadFile('campaigns', imagePath, imageFile!)

      // Step 2: Deploy to blockchain
      setDeployStatus({ uploading: false, deploying: true })
      
      // Convert target amount from IDR to ETH (mock conversion, adjust as needed)
      // For demo: 1 ETH = 50,000,000 IDR
      const targetInIDR = parseFloat(formData.targetAmount)
      const targetInETH = (targetInIDR / 50000000).toFixed(4)

      const { contractAddress, receipt } = await createBlockchainCampaign(
        formData.title,
        formData.description,
        formData.category,
        targetInETH,
        parseInt(formData.durationDays)
      )

      // Step 3: Save to database
      setDeployStatus({ deploying: false, saving: true })
      
      await createCampaign({
        creator_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        image_url: imageUrl,
        target_amount: parseFloat(formData.targetAmount),
        contract_address: contractAddress,
        status: 'pending_approval',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + parseInt(formData.durationDays) * 24 * 60 * 60 * 1000).toISOString(),
      })

      setDeployStatus({ success: true })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/org/campaigns')
      }, 2000)
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      setError(error.message || "Terjadi kesalahan saat membuat campaign")
      setDeployStatus({})
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (deployStatus.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Campaign Berhasil Dibuat!</h3>
            <p className="text-slate-600">
              Campaign Anda telah berhasil di-deploy ke blockchain dan menunggu approval admin.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-medium">✅ Campaign di-deploy ke blockchain</p>
              <p className="font-medium">⏳ Menunggu approval admin</p>
            </div>
            <p className="text-sm text-slate-500">Mengalihkan ke halaman campaigns...</p>
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
            href="/org/campaigns" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Buat Campaign Baru</h1>
          <p className="text-slate-600">Campaign akan di-deploy ke blockchain Sepolia</p>
        </div>

        {/* Wallet Warning */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-900">
                <p className="font-medium">Wallet Belum Terhubung</p>
                <p className="mt-1 text-yellow-800">
                  Silakan connect wallet Anda menggunakan tombol di navbar untuk melanjutkan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    currentStep >= step.id ? "text-blue-600 font-medium" : "text-slate-500"
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    currentStep > step.id ? "bg-blue-600" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="title">Judul Campaign *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contoh: Bantu Pendidikan Anak Kurang Mampu"
                    className="mt-2"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange} disabled={loading}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount">Target Donasi (IDR) *</Label>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      placeholder="50000000"
                      className="mt-2"
                      disabled={loading}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      ≈ {formData.targetAmount ? (parseFloat(formData.targetAmount) / 50000000).toFixed(4) : "0"} ETH
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="durationDays">Durasi (Hari) *</Label>
                    <Input
                      id="durationDays"
                      name="durationDays"
                      type="number"
                      value={formData.durationDays}
                      onChange={handleChange}
                      placeholder="30"
                      className="mt-2"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Description & Image */}
            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="description">Deskripsi Campaign *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Jelaskan secara detail tentang campaign Anda..."
                    rows={6}
                    className="mt-2"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Gambar Campaign *</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 border-2 border-slate-200 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview("")
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Klik untuk upload gambar</p>
                        <p className="text-xs text-slate-500 mt-1">JPG, PNG (Max 5MB)</p>
                        <input
                          id="image"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600">Judul</p>
                    <p className="font-semibold text-slate-900">{formData.title}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-600">Kategori</p>
                      <p className="font-semibold text-slate-900 capitalize">
                        {categories.find(c => c.value === formData.category)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Target</p>
                      <p className="font-semibold text-slate-900">
                        Rp {parseInt(formData.targetAmount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-slate-500">
                        ≈ {(parseFloat(formData.targetAmount) / 50000000).toFixed(4)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Durasi</p>
                      <p className="font-semibold text-slate-900">{formData.durationDays} hari</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Deskripsi</p>
                    <p className="text-sm text-slate-700 line-clamp-3">{formData.description}</p>
                  </div>
                </div>

                {/* Deploy Status */}
                {loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {deployStatus.uploading && "Mengupload gambar..."}
                          {deployStatus.deploying && "Deploy ke blockchain..."}
                          {deployStatus.saving && "Menyimpan ke database..."}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Mohon tunggu, jangan tutup halaman ini
                        </p>
                      </div>
                    </div>
                    <Progress value={
                      deployStatus.uploading ? 33 :
                      deployStatus.deploying ? 66 :
                      deployStatus.saving ? 90 : 0
                    } className="h-2" />
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                  <p className="font-medium">ℹ️ Informasi Penting</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                    <li>Campaign akan di-deploy ke blockchain Sepolia</li>
                    <li>Anda akan diminta approve transaction di wallet</li>
                    <li>Setelah deploy, campaign menunggu approval admin</li>
                    <li>Pastikan wallet Anda memiliki cukup Sepolia ETH untuk gas fee</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={loading}>
              Lanjut
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Deploy Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
