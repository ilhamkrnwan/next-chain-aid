"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getCurrentProfile, checkOrganizationStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight,
  Loader2,
  Mail,
  Wallet,
  Zap
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const profileData = await getCurrentProfile()
      if (profileData) {
        setProfile(profileData)
        const status = await checkOrganizationStatus(profileData.id)
        setOrgStatus(status)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-slate-900 pb-10">
          {/* Avatar Bulat Sesuai Navbar */}
          <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback className="bg-blue-600 text-white text-4xl font-black">
              {getInitials(profile.full_name || profile.email || "U")}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
              PROFIL <span className="text-blue-600">SAYA</span>
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest italic">
              Kelola Informasi Akun & Organisasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KARTU INFORMASI PRIBADI */}
          <div className="relative group">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3">
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
                <h3 className="font-black uppercase italic text-slate-900">Data Pengguna</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 italic">Nama Lengkap</Label>
                  <p className="font-bold text-slate-900 uppercase">{profile.full_name}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 italic">Alamat Email</Label>
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <Mail className="w-4 h-4 text-slate-900" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                {profile.wallet_address && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400 italic">Dompet Crypto</Label>
                    <div className="flex items-start gap-2 bg-slate-50 p-3 border-2 border-slate-900 rounded-xl">
                      <Wallet className="w-4 h-4 mt-1 shrink-0 text-slate-900" />
                      <span className="font-mono text-[10px] font-bold break-all text-blue-600 lowercase">
                        {profile.wallet_address}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Badge className="bg-pink-500 border-2 border-slate-900 text-white px-3 py-1 rounded-lg uppercase font-black italic text-[10px]">
                {profile.role} Account
              </Badge>
            </div>
          </div>

          {/* KARTU STATUS ORGANISASI */}
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-400 rounded-3xl translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-6 flex flex-col min-h-[300px]">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
                <Building2 className="w-5 h-5 text-slate-900" />
                <h3 className="font-black uppercase italic text-slate-900">Status Organisasi</h3>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {!orgStatus?.hasOrganization ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase italic leading-relaxed text-center">
                      Anda belum terdaftar sebagai organisasi mitra kami.
                    </p>
                    <Button 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-white font-black uppercase italic text-xs"
                      onClick={() => router.push('/register-org')}
                    >
                      Daftar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : orgStatus.status === 'pending' ? (
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 border-4 border-yellow-500 bg-yellow-50 rounded-full animate-pulse">
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase italic text-yellow-800 tracking-widest">Menunggu Verifikasi</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic">{orgStatus.organization?.name}</p>
                    </div>
                  </div>
                ) : orgStatus.status === 'approved' ? (
                  <div className="space-y-4 text-center">
                    <div className="inline-flex p-4 border-4 border-green-500 bg-green-50 rounded-full">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs font-black uppercase italic text-green-800">Organisasi Terverifikasi</p>
                    <Button 
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,0.3)] transition-all font-black uppercase italic text-xs"
                      onClick={() => router.push('/org')}
                    >
                      Buka Dashboard Admin
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 border-4 border-red-500 bg-red-50 rounded-full">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-xs font-black uppercase italic text-red-800">Pendaftaran Ditolak</p>
                    <Button 
                      variant="destructive"
                      className="w-full h-10 border-2 border-slate-900 font-black uppercase italic text-[10px]"
                      onClick={() => router.push('/register-org')}
                    >
                      Coba Daftar Lagi
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}