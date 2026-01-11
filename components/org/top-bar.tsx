"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Settings, User, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { Organization, Profile } from "@/lib/types"

export function OrgTopBar() {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Fetch organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id)
        .single()

      setOrganization(orgData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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
    if (!organization) return null

    switch (organization.status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={organization?.image_url || ""} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {organization ? getInitials(organization.name) : "ORG"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">
              {loading ? "Loading..." : organization?.name || "Organization"}
            </p>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {profile?.email || ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {/* <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" /> */}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {profile ? getInitials(profile.full_name || profile.email || "U") : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">
                {profile?.full_name?.split(' ')[0] || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <span>{profile?.full_name || "User"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {profile?.email || ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/org/profile">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>Profil Organisasi</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
