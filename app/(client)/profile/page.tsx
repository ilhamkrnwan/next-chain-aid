"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getCurrentProfile, checkOrganizationStatus } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight,
  Loader2,
  Mail,
  Wallet
} from "lucide-react"
import type { Profile, Organization } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orgStatus, setOrgStatus] = useState<{
    hasOrganization: boolean
    status: 'pending' | 'approved' | 'rejected' | null
    organization: Organization | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        router.push('/login')
        return
      }

      if (!user) {
        router.push('/login')
        return
      }

      // Get profile data
      try {
        const profileData = await getCurrentProfile()
        if (!profileData) {
          console.error('Profile data is null')
          setLoading(false)
          return
        }
        setProfile(profileData)

        // Get organization status
        try {
          const status = await checkOrganizationStatus(profileData.id)
          setOrgStatus(status)
        } catch (orgError) {
          console.error('Error checking organization status:', orgError)
          // Set default status if error
          setOrgStatus({
            hasOrganization: false,
            status: null,
            organization: null,
          })
        }
      } catch (profileError) {
        console.error('Error getting profile:', profileError)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Profil Saya
          </h1>
          <p className="text-slate-600">Kelola informasi akun Anda</p>
        </div>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(profile.full_name || profile.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ""}
                    readOnly
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      value={profile.email || ""}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            {profile.wallet_address && (
              <div>
                <Label htmlFor="wallet">Wallet Address</Label>
                <div className="relative mt-2">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="wallet"
                    value={profile.wallet_address}
                    readOnly
                    className="pl-10 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Role Badge */}
            <div>
              <Label>Status Akun</Label>
              <div className="mt-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {profile.role === 'user' ? 'User' : profile.role === 'org' ? 'Organisasi' : 'Admin'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Action Card */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Status Organisasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!orgStatus?.hasOrganization ? (
              // KONDISI A: Belum punya organisasi
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    Anda belum terdaftar sebagai organisasi
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Daftar sebagai organisasi untuk membuat campaign donasi dan mengelola dana
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => router.push('/register-org')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Daftar sebagai Organisasi
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : orgStatus.status === 'pending' ? (
              // KONDISI B: Organisasi pending
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 font-medium">
                        Pendaftaran Sedang Diproses
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Tim kami sedang melakukan verifikasi dokumen organisasi Anda. 
                        Proses ini biasanya memakan waktu 1-3 hari kerja.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-900">
                    Organisasi: {orgStatus.organization?.name}
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Clock className="w-3 h-3 mr-1" />
                    Menunggu Verifikasi
                  </Badge>
                </div>
              </div>
            ) : orgStatus.status === 'approved' ? (
              // KONDISI C: Organisasi approved
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-900 font-medium">
                        Organisasi Terverifikasi
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Selamat! Organisasi Anda telah diverifikasi dan dapat membuat campaign donasi.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {orgStatus.organization?.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {orgStatus.organization?.description}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Terverifikasi
                  </Badge>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => router.push('/org')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Buka Dashboard Organisasi
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              // KONDISI D: Organisasi rejected
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-900 font-medium">
                        Pendaftaran Ditolak
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Maaf, pendaftaran organisasi Anda ditolak.
                      </p>
                      {orgStatus.organization?.rejection_reason && (
                        <p className="text-xs text-red-700 mt-2 font-medium">
                          Alasan: {orgStatus.organization.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => router.push('/register-org')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Daftar Ulang
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
