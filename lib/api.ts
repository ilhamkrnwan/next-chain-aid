import { createClient } from '@/lib/supabase/client'
import type {
  Campaign,
  CampaignWithBlockchain,
  Organization,
  Profile,
  CampaignUpdate,
  PlatformStats,
  FilterParams,
  PaginationParams,
  PaginatedResponse,
  AdminAction,
  AdminDashboardStats,
} from '@/lib/types'

// ============================================================================
// CAMPAIGNS API
// ============================================================================

// lib/api.ts

export async function getEthPrice() {
  try {
    // Ambil harga ETH dalam IDR dan perubahan harganya dalam 24 jam
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=idr&include_24hr_change=true'
    );
    const data = await response.json();
    return {
      price: data.ethereum.idr,
      change: data.ethereum.idr_24h_change
    };
  } catch (error) {
    console.error("Gagal ambil harga ETH:", error);
    return { price: 42000000, change: 0 }; // Fallback harga kalau API limit
  }
}

/**
 * Get all campaigns with filters and pagination
 */
export async function getCampaigns(
  filters?: FilterParams,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Campaign>> {
  const supabase = createClient()
  const page = pagination?.page || 1
  const limit = pagination?.limit || 10
  const offset = (page - 1) * limit

  let query = supabase
    .from('campaigns')
    .select(`
      *,
      organization:organizations!campaigns_creator_id_fkey(
        *,
        profile:profiles!organizations_id_fkey(*)
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters?.creator_id) {
    query = query.eq('creator_id', filters.creator_id)
  }

  // Apply pagination and sorting
  query = query
    .range(offset, offset + limit - 1)
    .order(pagination?.sortBy || 'created_at', { ascending: pagination?.sortOrder === 'asc' })

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get single campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      organization:organizations!campaigns_creator_id_fkey(
        *,
        profile:profiles!organizations_id_fkey(*)
      ),
      updates:campaign_updates(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get active campaigns (for homepage)
 */
export async function getActiveCampaigns(limit: number = 6): Promise<Campaign[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      organization:organizations!campaigns_creator_id_fkey(
        *,
        profile:profiles!organizations_id_fkey(*)
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Create new campaign
 */
export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update campaign
 */
export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// ORGANIZATIONS API
// ============================================================================

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all organizations (for admin)
 */
export async function getOrganizations(status?: string): Promise<Organization[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('organizations')
    .select(`
      *,
      profile:profiles!organizations_id_fkey(*)
    `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create organization application
 */
export async function createOrganization(org: Partial<Organization>): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update organization
 */
export async function updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// PROFILES API
// ============================================================================

/**
 * Get current user profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Update profile
 */
export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// CAMPAIGN UPDATES API
// ============================================================================

/**
 * Get campaign updates
 */
export async function getCampaignUpdates(campaignId: string): Promise<CampaignUpdate[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaign_updates')
    .select(`
      *,
      author:profiles(*),
      campaign:campaigns(*)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create campaign update
 */
export async function createCampaignUpdate(update: Partial<CampaignUpdate>): Promise<CampaignUpdate> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaign_updates')
    .insert(update)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// STATS API
// ============================================================================

/**
 * Get platform statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = createClient()

  // Get total campaigns
  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })

  // Get active campaigns
  const { count: activeCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get total organizations
  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  // Note: Donations and total raised will come from blockchain
  // For now, return 0 or fetch from a cached table if you create one

  return {
    total_campaigns: totalCampaigns || 0,
    active_campaigns: activeCampaigns || 0,
    total_organizations: totalOrganizations || 0,
    total_donations: 0, // TODO: Fetch from blockchain
    total_raised: 0, // TODO: Fetch from blockchain
    total_donors: 0, // TODO: Fetch from blockchain
  }
}

// ============================================================================
// STORAGE API
// ============================================================================

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

/**
 * Get file URL from Supabase Storage
 */
export function getFileUrl(bucket: string, path: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

// ============================================================================
// USER ORGANIZATION HELPERS
// ============================================================================

/**
 * Get organization data for current user
 */
export async function getUserOrganization(userId: string): Promise<Organization | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        profile:profiles!organizations_id_fkey(*)
      `)
      .eq('id', userId)
      .single()

    if (error) {
      // If no organization found, return null (not an error)
      if (error.code === 'PGRST116') return null
      console.error('Error fetching organization:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error in getUserOrganization:', error)
    return null
  }
}

/**
 * Check organization status for user
 * Returns: null (no org), 'pending', 'approved', 'rejected'
 */
export async function checkOrganizationStatus(userId: string): Promise<{
  hasOrganization: boolean
  status: 'pending' | 'approved' | 'rejected' | null
  organization: Organization | null
}> {
  try {
    const organization = await getUserOrganization(userId)
    
    if (!organization) {
      return {
        hasOrganization: false,
        status: null,
        organization: null,
      }
    }
    
    return {
      hasOrganization: true,
      status: organization.status,
      organization,
    }
  } catch (error) {
    console.error('Unexpected error in checkOrganizationStatus:', error)
    return {
      hasOrganization: false,
      status: null,
      organization: null,
    }
  }
}

// ============================================================================
// ADMIN API
// ============================================================================

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(action: Omit<AdminAction, 'id' | 'created_at'>): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('admin_actions')
    .insert(action)

  if (error) {
    console.error('Failed to log admin action:', error)
  }
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(limit: number = 20): Promise<AdminAction[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('admin_actions')
    .select(`
      *,
      admin:profiles!admin_id(
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================================================
// ADMIN ORGANIZATION MANAGEMENT
// ============================================================================

/**
 * Approve organization
 */
export async function approveOrganization(
  orgId: string,
  adminId: string
): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update({
      status: 'approved',
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminId,
    })
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error

  // Update user role to 'org'
  await supabase
    .from('profiles')
    .update({ role: 'org' })
    .eq('id', orgId)

  // Log admin action
  await logAdminAction({
    admin_id: adminId,
    action_type: 'approve_organization',
    target_type: 'organization',
    target_id: orgId,
  })

  return data
}

/**
 * Reject organization
 */
export async function rejectOrganization(
  orgId: string,
  adminId: string,
  reason: string
): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'reject_organization',
    target_type: 'organization',
    target_id: orgId,
    details: { reason },
  })

  return data
}

/**
 * Ban organization
 */
export async function banOrganization(
  orgId: string,
  adminId: string,
  reason: string
): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: adminId,
      ban_reason: reason,
    })
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'ban_organization',
    target_type: 'organization',
    target_id: orgId,
    details: { reason },
  })

  return data
}

/**
 * Unban organization
 */
export async function unbanOrganization(
  orgId: string,
  adminId: string
): Promise<Organization> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update({
      is_banned: false,
      banned_at: null,
      banned_by: null,
      ban_reason: null,
    })
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'unban_organization',
    target_type: 'organization',
    target_id: orgId,
  })

  return data
}

// ============================================================================
// ADMIN CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * Approve campaign
 */
export async function approveCampaign(
  campaignId: string,
  adminId: string
): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: adminId,
    })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'approve_campaign',
    target_type: 'campaign',
    target_id: campaignId,
  })

  return data
}

/**
 * Reject campaign
 */
export async function rejectCampaign(
  campaignId: string,
  adminId: string,
  reason: string
): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      status: 'draft',
      rejection_reason: reason,
    })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'reject_campaign',
    target_type: 'campaign',
    target_id: campaignId,
    details: { reason },
  })

  return data
}

/**
 * Freeze campaign
 */
export async function freezeCampaign(
  campaignId: string,
  adminId: string,
  reason: string
): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      is_frozen: true,
      frozen_at: new Date().toISOString(),
      frozen_by: adminId,
      freeze_reason: reason,
      status: 'frozen',
    })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'freeze_campaign',
    target_type: 'campaign',
    target_id: campaignId,
    details: { reason },
  })

  return data
}

/**
 * Unfreeze campaign
 */
export async function unfreezeCampaign(
  campaignId: string,
  adminId: string
): Promise<Campaign> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      is_frozen: false,
      frozen_at: null,
      frozen_by: null,
      freeze_reason: null,
      status: 'active',
    })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  await logAdminAction({
    admin_id: adminId,
    action_type: 'unfreeze_campaign',
    target_type: 'campaign',
    target_id: campaignId,
  })

  return data
}

// ============================================================================
// ADMIN STATISTICS
// ============================================================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createClient()

  // Get organization counts
  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: approvedOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: rejectedOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  const { count: bannedOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('is_banned', true)

  // Get campaign counts
  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })

  const { count: activeCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_approval')

  const { count: frozenCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('is_frozen', true)

  // Get user count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return {
    totalOrganizations: totalOrganizations || 0,
    pendingOrganizations: pendingOrganizations || 0,
    approvedOrganizations: approvedOrganizations || 0,
    rejectedOrganizations: rejectedOrganizations || 0,
    bannedOrganizations: bannedOrganizations || 0,
    totalCampaigns: totalCampaigns || 0,
    activeCampaigns: activeCampaigns || 0,
    pendingCampaigns: pendingCampaigns || 0,
    frozenCampaigns: frozenCampaigns || 0,
    totalUsers: totalUsers || 0,
    // Blockchain stats will be added later
    totalDonations: 0,
    totalRaised: 0,
    totalDonors: 0,
  }
}
