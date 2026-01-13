import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizationPublicProfile } from '@/components/organization/public-profile'
import { OrganizationPublicStats } from '@/components/organization/public-stats'
import { OrganizationPublicCampaignList } from '@/components/organization/public-campaign-list'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, description')
    .eq('id', params.id)
    .single()

  if (!organization) {
    return {
      title: 'Organization Not Found',
    }
  }

  return {
    title: `${organization.name} - ChainAid`,
    description: organization.description || `View ${organization.name}'s campaigns and impact on ChainAid`,
  }
}

export default async function OrganizationPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch organization data
  const { data: organization, error } = await supabase
    .from('organizations')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !organization) {
    notFound()
  }

  // Only show approved organizations to public
  if (organization.status !== 'approved') {
    notFound()
  }

  // Fetch organization's campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('creator_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <OrganizationPublicProfile organization={organization} />
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-8">
        <OrganizationPublicStats 
          organizationId={organization.id}
          walletAddress={organization.profile?.wallet_address || ''}
          campaigns={campaigns || []}
        />
      </div>

      {/* Campaigns */}
      <div className="container mx-auto px-4 py-12">
        <OrganizationPublicCampaignList campaigns={campaigns || []} />
      </div>
    </div>
  )
}
