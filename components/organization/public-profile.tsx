import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building2, Globe, MapPin, Phone, CheckCircle2 } from 'lucide-react'
import type { Organization } from '@/lib/types'

interface OrganizationPublicProfileProps {
  organization: Organization
}

export function OrganizationPublicProfile({ organization }: OrganizationPublicProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Logo */}
      <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white shadow-lg">
        <AvatarImage src={organization.image_url || ''} alt={organization.name} />
        <AvatarFallback className="text-2xl md:text-3xl bg-blue-100 text-blue-600">
          {getInitials(organization.name)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">{organization.name}</h1>
          {organization.is_verified && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Terverifikasi
            </Badge>
          )}
        </div>

        {organization.description && (
          <p className="text-blue-100 text-lg mb-4 max-w-3xl">
            {organization.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-blue-100">
          {organization.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{organization.address}</span>
            </div>
          )}
          {organization.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{organization.phone}</span>
            </div>
          )}
          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm underline">{organization.website}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
