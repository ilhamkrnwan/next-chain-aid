// ============================================================================
// Database Types
// ============================================================================

export type UserRole = 'user' | 'org' | 'admin'
export type OrgStatus = 'pending' | 'approved' | 'rejected'
export type CampaignStatus = 'draft' | 'pending_approval' | 'active' | 'ended' | 'frozen'
export type CampaignCategory = 'kesehatan' | 'pendidikan' | 'bencana_alam' | 'lingkungan' | 'sosial' | 'ekonomi' | 'lainnya'

// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  wallet_address: string | null
  role: UserRole
  bio: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  id: string
  name: string
  description: string | null
  phone: string | null
  address: string | null
  website: string | null
  image_url: string | null
  ktp_url: string | null
  legal_doc_url: string | null
  is_verified: boolean
  status: OrgStatus
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  is_banned: boolean
  banned_at: string | null
  banned_by: string | null
  ban_reason: string | null
  created_at: string
  updated_at: string
  // Relations
  profile?: Profile
}

// ============================================================================
// Campaign Types
// ============================================================================

export interface Campaign {
  id: string
  creator_id: string
  title: string
  description: string
  category: CampaignCategory
  image_url: string | null
  target_amount: number
  contract_address: string | null
  status: CampaignStatus
  start_date: string | null
  end_date: string | null
  approved_at: string | null
  approved_by: string | null
  rejection_reason: string | null
  is_frozen: boolean
  frozen_at: string | null
  frozen_by: string | null
  freeze_reason: string | null
  created_at: string
  updated_at: string
  // Relations
  organization?: Organization
  creator?: Profile
  // Blockchain data (fetched separately)
  collected_amount?: number
  donor_count?: number
  balance?: number
  is_active?: boolean
  deadline?: number
}

// ============================================================================
// Campaign Update Types
// ============================================================================

export interface CampaignUpdate {
  id: string
  campaign_id: string
  title: string
  content: string
  created_by: string
  created_at: string
  // Relations
  campaign?: Campaign
  author?: Profile
  images?: CampaignUpdateImage[]
}

export interface CampaignUpdateImage {
  id: string
  campaign_update_id: string
  image_url: string
  display_order: number
  created_at: string
}

// ============================================================================
// Blockchain Types (from smart contract)
// ============================================================================

export interface Donation {
  donor: string
  amount: bigint
  timestamp: number
  message: string
}

export interface Withdrawal {
  amount: bigint
  description: string
  recipient: string
  timestamp: number
  completed: boolean
}

export interface BlockchainCampaignData {
  organization: string
  title: string
  description: string
  category: string
  targetAmount: bigint
  collectedAmount: bigint
  balance: bigint
  deadline: number
  isActive: boolean
  isFrozen: boolean
  donationCount: number
  donorCount: number
}

// ============================================================================
// Combined Types (DB + Blockchain)
// ============================================================================

export interface CampaignWithBlockchain extends Campaign {
  // Blockchain data
  blockchain: {
    collected_amount: number
    balance: number
    donor_count: number
    donation_count: number
    is_active: boolean
    is_frozen: boolean
    deadline: number
    progress_percentage: number
    days_remaining: number
  }
  // Computed fields
  progress: number
  daysRemaining: number
}

// ============================================================================
// Transaction Types (for transparency page)
// ============================================================================

export interface Transaction {
  id: string
  type: 'donation' | 'withdrawal'
  campaign_id: string
  campaign_title: string
  amount: number
  from_address?: string
  to_address?: string
  message?: string
  description?: string
  timestamp: number
  tx_hash?: string
  // Relations
  campaign?: Campaign
}

// ============================================================================
// Stats Types
// ============================================================================

export interface PlatformStats {
  total_campaigns: number
  total_donations: number
  total_raised: number
  total_donors: number
  total_organizations: number
  active_campaigns: number
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  category?: CampaignCategory
  status?: CampaignStatus
  search?: string
  creator_id?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// Admin Types
// ============================================================================

export interface AdminAction {
  id: string
  admin_id: string
  action_type: string
  target_type: 'organization' | 'campaign' | 'user'
  target_id: string
  details?: Record<string, any>
  created_at: string
  // Relations
  admin?: Profile
}

export interface AdminDashboardStats {
  totalOrganizations: number
  pendingOrganizations: number
  approvedOrganizations: number
  rejectedOrganizations: number
  bannedOrganizations: number
  totalCampaigns: number
  activeCampaigns: number
  pendingCampaigns: number
  frozenCampaigns: number
  totalUsers: number
  totalDonations: number
  totalRaised: number
  totalDonors: number
}

export interface BlockchainTransaction {
  type: 'donation' | 'withdrawal'
  contractAddress: string
  from?: string
  to?: string
  amount: string
  message?: string
  description?: string
  timestamp: number
  txHash?: string
}

// ============================================================================
// FastAPI Integration Types
// ============================================================================

export interface OrganizationDetail extends Organization {
  profile: Profile
  campaigns: Campaign[]
}


