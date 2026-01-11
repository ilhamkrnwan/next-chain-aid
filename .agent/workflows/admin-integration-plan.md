---
description: Implementation Plan - Admin Panel Supabase & Blockchain Integration
---

# 🚀 Implementation Plan: Admin Panel Integration

**Project:** ChainAid - Admin Dashboard Full Integration  
**Date:** 2026-01-11  
**Objective:** Mengintegrasikan Supabase dan Blockchain secara penuh untuk semua fitur Admin Panel

---

## 📋 Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Database Schema Updates](#database-schema-updates)
3. [API Layer Enhancement](#api-layer-enhancement)
4. [Admin Features Implementation](#admin-features-implementation)
5. [Implementation Phases](#implementation-phases)
6. [Testing Strategy](#testing-strategy)

---

## 🔍 Current State Analysis

### ✅ Already Implemented

- **Authentication & Authorization**: Middleware dengan role-based access (admin, org, user)
- **Admin Layout**: Sidebar, TopBar, dan routing structure
- **Organization Management**: `/admin/organisasi` dengan Supabase integration (partial)
- **Database Schema**: Basic tables (profiles, organizations, campaigns)
- **Blockchain Layer**: `lib/blockchain.ts` dengan ethers.js integration

### ❌ Not Yet Integrated / Using Mock Data

1. **Dashboard Overview** (`/admin/page.tsx`)

   - OverviewStats: Menggunakan hardcoded data
   - PendingOrganizations: Menggunakan mock data
   - DonationChart: Menggunakan mock data
   - CategoryChart: Menggunakan mock data
   - ActivityTimeline: Menggunakan mock data

2. **Campaign Management** (`/admin/campaign/page.tsx`)

   - Semua data menggunakan hardcoded array
   - Tidak ada integrasi Supabase
   - Tidak ada integrasi blockchain untuk status campaign

3. **Transaction Management** (`/admin/transaksi/page.tsx`)

   - Menggunakan `mockTransactions` dari `lib/mock-transactions.ts`
   - Tidak ada fetch dari blockchain
   - Tidak ada export functionality yang real

4. **Blockchain Explorer** (`/admin/blockchain/page.tsx`)
   - Semua data hardcoded
   - Tidak ada real-time blockchain monitoring
   - Tidak ada contract interaction

---

## 🗄️ Database Schema Updates

### Migration 005: Admin Actions Audit Log

**File:** `migrations/005_admin_audit_log.sql`

```sql
-- Table untuk logging semua aksi admin
CREATE TABLE public.admin_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  action_type text NOT NULL, -- 'approve_org', 'reject_org', 'ban_org', 'approve_campaign', etc.
  target_type text NOT NULL, -- 'organization', 'campaign', 'user'
  target_id uuid NOT NULL,
  details jsonb, -- Additional context
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index untuk performance
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target ON public.admin_actions(target_type, target_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- RLS policies
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all actions"
  ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Migration 006: Organization Ban & Enhanced Fields

**File:** `migrations/006_organization_ban_fields.sql`

```sql
-- Add ban-related fields to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS ban_reason text;

-- Add comments
COMMENT ON COLUMN public.organizations.is_banned IS 'Whether organization is banned from platform';
COMMENT ON COLUMN public.organizations.banned_at IS 'Timestamp when organization was banned';
COMMENT ON COLUMN public.organizations.banned_by IS 'Admin ID who banned the organization';
COMMENT ON COLUMN public.organizations.ban_reason IS 'Reason for banning the organization';

-- Update RLS policies to prevent banned orgs from creating campaigns
CREATE POLICY "Banned orgs cannot create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM organizations
      WHERE id = auth.uid() AND is_banned = true
    )
  );
```

### Migration 007: Campaign Enhanced Fields

**File:** `migrations/007_campaign_enhanced_fields.sql`

```sql
-- Add missing fields to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS frozen_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS freeze_reason text,
ADD COLUMN IF NOT EXISTS category campaign_category DEFAULT 'lainnya';

-- Add campaign_category enum if not exists
DO $$ BEGIN
  CREATE TYPE campaign_category AS ENUM (
    'kesehatan', 'pendidikan', 'bencana_alam',
    'lingkungan', 'sosial', 'ekonomi', 'lainnya'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update column type
ALTER TABLE public.campaigns
ALTER COLUMN category TYPE campaign_category USING category::campaign_category;

-- Add comments
COMMENT ON COLUMN public.campaigns.is_frozen IS 'Whether campaign is frozen by admin';
COMMENT ON COLUMN public.campaigns.frozen_at IS 'Timestamp when campaign was frozen';
COMMENT ON COLUMN public.campaigns.frozen_by IS 'Admin ID who froze the campaign';
COMMENT ON COLUMN public.campaigns.freeze_reason IS 'Reason for freezing the campaign';
```

### Migration 008: Platform Statistics View

**File:** `migrations/008_platform_stats_view.sql`

```sql
-- Create materialized view for platform statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_statistics AS
SELECT
  (SELECT COUNT(*) FROM organizations WHERE status = 'approved') as total_organizations,
  (SELECT COUNT(*) FROM organizations WHERE status = 'pending') as pending_organizations,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM campaigns) as total_campaigns,
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as total_users,
  NOW() as last_updated;

-- Create index
CREATE UNIQUE INDEX idx_platform_stats ON platform_statistics (last_updated);

-- Function to refresh stats
CREATE OR REPLACE FUNCTION refresh_platform_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY platform_statistics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (manual for now, can use pg_cron extension)
-- Call this function periodically or after major updates
```

---

## 🔧 API Layer Enhancement

### 1. Admin-Specific API Functions

**File:** `lib/admin-api.ts` (NEW)

```typescript
import { createClient } from "@/lib/supabase/client";
import type { Organization, Campaign, Profile } from "@/lib/types";

// ============================================================================
// ADMIN ORGANIZATION MANAGEMENT
// ============================================================================

export async function approveOrganization(
  orgId: string,
  adminId: string
): Promise<Organization> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      status: "approved",
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminId,
    })
    .eq("id", orgId)
    .select()
    .single();

  if (error) throw error;

  // Update user role to 'org'
  await supabase.from("profiles").update({ role: "org" }).eq("id", orgId);

  // Log admin action
  await logAdminAction({
    admin_id: adminId,
    action_type: "approve_organization",
    target_type: "organization",
    target_id: orgId,
  });

  return data;
}

export async function rejectOrganization(
  orgId: string,
  adminId: string,
  reason: string
): Promise<Organization> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", orgId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction({
    admin_id: adminId,
    action_type: "reject_organization",
    target_type: "organization",
    target_id: orgId,
    details: { reason },
  });

  return data;
}

export async function banOrganization(
  orgId: string,
  adminId: string,
  reason: string
): Promise<Organization> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: adminId,
      ban_reason: reason,
    })
    .eq("id", orgId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction({
    admin_id: adminId,
    action_type: "ban_organization",
    target_type: "organization",
    target_id: orgId,
    details: { reason },
  });

  return data;
}

// ============================================================================
// ADMIN CAMPAIGN MANAGEMENT
// ============================================================================

export async function approveCampaign(
  campaignId: string,
  adminId: string
): Promise<Campaign> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      status: "active",
      approved_at: new Date().toISOString(),
      approved_by: adminId,
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction({
    admin_id: adminId,
    action_type: "approve_campaign",
    target_type: "campaign",
    target_id: campaignId,
  });

  return data;
}

export async function freezeCampaign(
  campaignId: string,
  adminId: string,
  reason: string
): Promise<Campaign> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      is_frozen: true,
      frozen_at: new Date().toISOString(),
      frozen_by: adminId,
      freeze_reason: reason,
      status: "frozen",
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction({
    admin_id: adminId,
    action_type: "freeze_campaign",
    target_type: "campaign",
    target_id: campaignId,
    details: { reason },
  });

  return data;
}

// ============================================================================
// ADMIN STATISTICS
// ============================================================================

export async function getAdminDashboardStats() {
  const supabase = createClient();

  // Get platform stats
  const { data: stats } = await supabase
    .from("platform_statistics")
    .select("*")
    .single();

  // Get recent organizations (pending)
  const { data: pendingOrgs } = await supabase
    .from("organizations")
    .select("*, profile:profiles(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent campaigns (pending approval)
  const { data: pendingCampaigns } = await supabase
    .from("campaigns")
    .select("*, organization:organizations(*)")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    stats,
    pendingOrgs,
    pendingCampaigns,
  };
}

export async function getCampaignsByStatus(status?: string) {
  const supabase = createClient();

  let query = supabase
    .from("campaigns")
    .select(
      `
      *,
      organization:organizations(
        id,
        name,
        image_url
      ),
      creator:profiles(
        id,
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// ============================================================================
// ADMIN AUDIT LOG
// ============================================================================

export async function logAdminAction(action: {
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details?: any;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("admin_actions").insert(action);

  if (error) console.error("Failed to log admin action:", error);
}

export async function getAdminActivityLog(limit = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("admin_actions")
    .select(
      `
      *,
      admin:profiles!admin_id(
        id,
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

### 2. Blockchain Integration for Admin

**File:** `lib/admin-blockchain.ts` (NEW)

```typescript
import {
  getAllBlockchainCampaigns,
  getCampaignSummary,
  getCampaignDonations,
  getCampaignWithdrawals,
  weiToEth,
} from "@/lib/blockchain";

// ============================================================================
// ADMIN BLOCKCHAIN MONITORING
// ============================================================================

export async function getAllCampaignsWithBlockchainData() {
  try {
    const contractAddresses = await getAllBlockchainCampaigns();

    const campaignsData = await Promise.all(
      contractAddresses.map(async (address) => {
        try {
          const summary = await getCampaignSummary(address);
          const donations = await getCampaignDonations(address);
          const withdrawals = await getCampaignWithdrawals(address);

          return {
            contractAddress: address,
            summary,
            donations,
            withdrawals,
            totalDonations: donations.length,
            totalWithdrawals: withdrawals.length,
          };
        } catch (error) {
          console.error(`Failed to fetch data for ${address}:`, error);
          return null;
        }
      })
    );

    return campaignsData.filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch blockchain campaigns:", error);
    return [];
  }
}

export async function getBlockchainStats() {
  try {
    const campaigns = await getAllCampaignsWithBlockchainData();

    let totalDonations = 0;
    let totalAmount = BigInt(0);
    let totalWithdrawals = 0;
    let totalWithdrawnAmount = BigInt(0);

    campaigns.forEach((campaign) => {
      if (campaign) {
        totalDonations += campaign.totalDonations;
        totalAmount += campaign.summary.collectedAmount;
        totalWithdrawals += campaign.totalWithdrawals;
        campaign.withdrawals.forEach((w) => {
          totalWithdrawnAmount += w.amount;
        });
      }
    });

    return {
      totalCampaigns: campaigns.length,
      totalDonations,
      totalAmount: weiToEth(totalAmount),
      totalWithdrawals,
      totalWithdrawnAmount: weiToEth(totalWithdrawnAmount),
      campaigns,
    };
  } catch (error) {
    console.error("Failed to get blockchain stats:", error);
    return null;
  }
}

export async function getAllTransactionsFromBlockchain() {
  try {
    const campaigns = await getAllCampaignsWithBlockchainData();

    const allTransactions: any[] = [];

    campaigns.forEach((campaign) => {
      if (!campaign) return;

      // Add donations
      campaign.donations.forEach((donation) => {
        allTransactions.push({
          type: "donation",
          contractAddress: campaign.contractAddress,
          donor: donation.donor,
          amount: weiToEth(donation.amount),
          message: donation.message,
          timestamp: donation.timestamp,
        });
      });

      // Add withdrawals
      campaign.withdrawals.forEach((withdrawal) => {
        allTransactions.push({
          type: "withdrawal",
          contractAddress: campaign.contractAddress,
          recipient: withdrawal.recipient,
          amount: weiToEth(withdrawal.amount),
          description: withdrawal.description,
          timestamp: withdrawal.timestamp,
          completed: withdrawal.completed,
        });
      });
    });

    // Sort by timestamp descending
    allTransactions.sort((a, b) => b.timestamp - a.timestamp);

    return allTransactions;
  } catch (error) {
    console.error("Failed to get all transactions:", error);
    return [];
  }
}
```

---

## 🎯 Admin Features Implementation

### Phase 1: Dashboard Overview Integration

**Priority:** HIGH  
**Files to Update:**

- `components/admin/overview-stats.tsx`
- `components/admin/pending-organizations.tsx`
- `components/admin/donation-chart.tsx`
- `components/admin/category-chart.tsx`
- `components/admin/activity-timeline.tsx`

**Tasks:**

1. ✅ Update `OverviewStats` to fetch real data from Supabase
2. ✅ Update `PendingOrganizations` to fetch from Supabase
3. ✅ Update `DonationChart` to fetch blockchain data
4. ✅ Update `CategoryChart` to fetch from Supabase
5. ✅ Update `ActivityTimeline` to fetch from admin_actions table

### Phase 2: Organization Management Enhancement

**Priority:** HIGH  
**Files to Update:**

- `app/admin/organisasi/page.tsx`

**Tasks:**

1. ✅ Add Ban/Unban functionality
2. ✅ Add Edit organization details
3. ✅ Add View organization history
4. ✅ Improve approve/reject with better UX
5. ✅ Add bulk actions

### Phase 3: Campaign Management Integration

**Priority:** HIGH  
**Files to Update:**

- `app/admin/campaign/page.tsx`
- `app/admin/campaign/review/[id]/page.tsx` (NEW)

**Tasks:**

1. ✅ Fetch campaigns from Supabase
2. ✅ Integrate blockchain data for each campaign
3. ✅ Add approve/reject functionality
4. ✅ Add freeze/unfreeze functionality
5. ✅ Create campaign review detail page
6. ✅ Add filters and search

### Phase 4: Transaction Management Integration

**Priority:** MEDIUM  
**Files to Update:**

- `components/admin/transaksi-content.tsx`

**Tasks:**

1. ✅ Fetch transactions from blockchain
2. ✅ Match with Supabase campaign data
3. ✅ Add real export to CSV functionality
4. ✅ Add transaction verification
5. ✅ Add suspicious transaction flagging

### Phase 5: Blockchain Explorer Enhancement

**Priority:** MEDIUM  
**Files to Update:**

- `app/admin/blockchain/page.tsx`

**Tasks:**

1. ✅ Fetch real contract data
2. ✅ Add real-time network status
3. ✅ Add transaction verification tool
4. ✅ Add contract interaction logs
5. ✅ Add blockchain analytics

### Phase 6: User Management (NEW)

**Priority:** LOW  
**Files to Create:**

- `app/admin/users/page.tsx`

**Tasks:**

1. ✅ Create user list page
2. ✅ Add user search and filters
3. ✅ Add change role functionality
4. ✅ Add ban/unban user
5. ✅ Add user activity log

### Phase 7: Settings & Configuration

**Priority:** LOW  
**Files to Update:**

- `app/admin/settings/page.tsx`

**Tasks:**

1. ✅ Add platform configuration
2. ✅ Add admin user management
3. ✅ Add system logs viewer
4. ✅ Add backup/restore functionality

---

## 📅 Implementation Phases

### Week 1: Foundation & Database

- [ ] Run migrations 005-008
- [ ] Create `lib/admin-api.ts`
- [ ] Create `lib/admin-blockchain.ts`
- [ ] Test all new API functions
- [ ] Update types in `lib/types.ts`

### Week 2: Dashboard & Organizations

- [ ] Implement Phase 1 (Dashboard Overview)
- [ ] Implement Phase 2 (Organization Management)
- [ ] Test and fix bugs
- [ ] Add loading states and error handling

### Week 3: Campaigns & Transactions

- [ ] Implement Phase 3 (Campaign Management)
- [ ] Implement Phase 4 (Transaction Management)
- [ ] Test blockchain integration
- [ ] Add loading states and error handling

### Week 4: Blockchain & Polish

- [ ] Implement Phase 5 (Blockchain Explorer)
- [ ] Implement Phase 6 (User Management)
- [ ] Implement Phase 7 (Settings)
- [ ] Final testing and bug fixes
- [ ] Performance optimization

---

## 🧪 Testing Strategy

### Unit Tests

- Test all admin API functions
- Test blockchain integration functions
- Test data transformation utilities

### Integration Tests

- Test admin approve/reject flow
- Test campaign freeze flow
- Test blockchain data fetching
- Test audit logging

### Manual Testing Checklist

- [ ] Admin can approve organization
- [ ] Admin can reject organization with reason
- [ ] Admin can ban organization
- [ ] Admin can approve campaign
- [ ] Admin can freeze campaign
- [ ] Dashboard shows real statistics
- [ ] Transactions are fetched from blockchain
- [ ] Audit log records all actions
- [ ] Export functionality works
- [ ] All filters and search work correctly

---

## 🔐 Security Considerations

1. **RLS Policies**: Ensure all tables have proper RLS policies for admin access
2. **Audit Logging**: All admin actions must be logged
3. **Input Validation**: Validate all admin inputs (especially ban/reject reasons)
4. **Rate Limiting**: Consider rate limiting for admin actions
5. **Two-Factor Auth**: Consider 2FA for critical admin actions

---

## 📊 Success Metrics

- ✅ Zero mock data in admin panel
- ✅ All data fetched from Supabase or Blockchain
- ✅ Admin actions logged in audit table
- ✅ Page load time < 2 seconds
- ✅ Error handling for all edge cases
- ✅ Responsive design on all screen sizes

---

## 🚨 Known Issues & Risks

1. **Blockchain Rate Limiting**: Too many blockchain calls may hit rate limits
   - **Solution**: Implement caching layer with Redis or local storage
2. **Large Dataset Performance**: Fetching all transactions may be slow
   - **Solution**: Implement pagination and lazy loading
3. **Real-time Updates**: Dashboard stats may be stale
   - **Solution**: Implement polling or WebSocket for real-time updates

---

## 📝 Notes

- Prioritize user experience and performance
- Follow Next.js 16 and React 19 best practices
- Use TypeScript strictly (no `any` types)
- Implement proper error boundaries
- Add loading skeletons for better UX
- Use optimistic updates where appropriate
- Cache blockchain data to reduce RPC calls

---

**End of Implementation Plan**
