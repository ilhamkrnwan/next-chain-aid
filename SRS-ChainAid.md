# Software Requirements Specification (SRS)

# ChainAid - Transparent Donation Platform

**Version:** 1.0  
**Date:** January 13, 2026  
**Author:** ChainAid Development Team

---

## 1. INTRODUCTION

### 1.1 Purpose

ChainAid adalah platform donasi transparan berbasis blockchain yang menghubungkan donatur dengan organisasi sosial. Platform ini memastikan transparansi penuh dalam pengelolaan dana donasi melalui teknologi smart contract Ethereum.

### 1.2 Scope

Sistem ini mencakup:

- Manajemen kampanye donasi berbasis blockchain
- Sistem autentikasi dan otorisasi multi-role
- Dashboard admin untuk verifikasi organisasi dan kampanye
- Dashboard organisasi untuk mengelola kampanye dan distribusi dana
- Interface publik untuk donasi dan tracking transparansi
- Integrasi Web3 dengan MetaMask/WalletConnect

### 1.3 Definitions & Acronyms

- **Smart Contract**: Program self-executing di blockchain
- **Web3**: Teknologi blockchain untuk aplikasi terdesentralisasi
- **Supabase**: Backend-as-a-Service untuk database dan autentikasi
- **RainbowKit**: Library untuk koneksi Web3 wallet
- **Sepolia**: Ethereum testnet untuk development

---

## 2. SYSTEM OVERVIEW

### 2.1 Technology Stack

#### Frontend

- **Framework**: Next.js 16 (React 19)
- **Styling**: TailwindCSS 4 + Radix UI components
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Web3**: Wagmi + Viem + RainbowKit + Ethers.js

#### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Blockchain**: Ethereum (Sepolia testnet)
- **Smart Contract**: Solidity ^0.8.20

#### Development

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Build Tool**: Next.js compiler

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  Next.js App + Web3 Provider + RainbowKit               │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│   Supabase     │  │   Blockchain    │
│   (Database)   │  │  (Smart Contract)│
│   - Auth       │  │  - Campaigns    │
│   - Storage    │  │  - Donations    │
│   - Profiles   │  │  - Withdrawals  │
└────────────────┘  └─────────────────┘
```

---

## 3. USER ROLES & PERMISSIONS

### 3.1 User (Donatur)

**Akses:**

- ✅ Melihat semua kampanye publik
- ✅ Melakukan donasi via Web3 wallet
- ✅ Melihat riwayat donasi pribadi
- ✅ Melihat transparansi transaksi blockchain
- ✅ Mengelola profil pribadi
- ❌ Membuat kampanye
- ❌ Akses dashboard admin/organisasi

### 3.2 Organization (Organisasi)

**Akses:**

- ✅ Semua akses User
- ✅ Membuat dan mengelola kampanye (setelah approved)
- ✅ Menarik dana dari kampanye
- ✅ Posting update kampanye
- ✅ Melihat statistik kampanye
- ✅ Mengelola profil organisasi
- ❌ Akses dashboard admin
- ❌ Verifikasi organisasi lain

**Status Organisasi:**

- `pending`: Menunggu verifikasi admin
- `approved`: Terverifikasi, dapat membuat kampanye
- `rejected`: Ditolak admin
- `banned`: Diblokir oleh admin

### 3.3 Admin

**Akses:**

- ✅ Semua akses User dan Organization
- ✅ Verifikasi/reject organisasi
- ✅ Approve/reject kampanye
- ✅ Freeze/unfreeze kampanye
- ✅ Ban/unban organisasi
- ✅ Melihat semua statistik platform
- ✅ Monitoring transaksi blockchain
- ✅ Manajemen sistem

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication & Authorization

#### FR-AUTH-001: User Registration

- User dapat mendaftar dengan email dan password
- Sistem mengirim email verifikasi
- Default role: `user`
- Validasi: email valid, password min 8 karakter

#### FR-AUTH-002: User Login

- Login dengan email/password
- Session management dengan Supabase Auth
- Redirect berdasarkan role:
  - Admin → `/admin`
  - Organization → `/org`
  - User → `/profile`

#### FR-AUTH-003: Password Reset

- User dapat request reset password via email
- Link reset valid 1 jam
- Password baru harus berbeda dari yang lama

#### FR-AUTH-004: Role-Based Access Control

- Middleware memvalidasi role untuk setiap route
- Unauthorized access redirect ke homepage
- Organization harus approved untuk akses fitur tertentu

### 4.2 Organization Management

#### FR-ORG-001: Organization Registration

- User dapat upgrade ke role `org`
- Required data:
  - Nama organisasi
  - Deskripsi
  - Alamat, telepon, website
  - Upload KTP/identitas
  - Upload dokumen legal
  - Upload foto/logo organisasi
- Status awal: `pending`

#### FR-ORG-002: Organization Verification (Admin)

- Admin dapat melihat daftar organisasi pending
- Admin dapat approve/reject dengan alasan
- Approved: status → `approved`, `is_verified` → true
- Rejected: status → `rejected`, simpan `rejection_reason`
- Email notification ke organisasi

#### FR-ORG-003: Organization Ban/Unban (Admin)

- Admin dapat ban organisasi dengan alasan
- Banned organization tidak dapat:
  - Membuat kampanye baru
  - Edit kampanye existing
  - Menarik dana
- Admin dapat unban organisasi

#### FR-ORG-004: Organization Profile Management

- Organization dapat edit profil:
  - Nama, deskripsi, kontak
  - Upload/update foto
  - Update website
- Tidak dapat edit dokumen legal setelah approved

### 4.3 Campaign Management

#### FR-CAMP-001: Create Campaign (Organization)

- Organization (approved) dapat membuat kampanye
- Required data:
  - Judul (min 10 karakter)
  - Deskripsi lengkap
  - Kategori (kesehatan, pendidikan, bencana, dll)
  - Target amount (min 0.01 ETH)
  - Durasi (dalam hari)
  - Upload gambar kampanye
- Sistem deploy smart contract ke blockchain
- Status awal: `pending_approval`

#### FR-CAMP-002: Campaign Approval (Admin)

- Admin review kampanye pending
- Admin dapat approve/reject dengan alasan
- Approved: status → `active`, campaign mulai menerima donasi
- Rejected: status → `rejected`, simpan `rejection_reason`

#### FR-CAMP-003: Edit Campaign (Organization)

- Organization dapat edit kampanye dengan batasan:
  - Hanya kampanye milik sendiri
  - Tidak dapat edit: target amount, durasi
  - Dapat edit: judul, deskripsi, gambar
- Edit memerlukan re-approval jika signifikan

#### FR-CAMP-004: Campaign Status Management

- Organization dapat end/reactivate kampanye
- Admin dapat freeze/unfreeze kampanye
- Status:
  - `draft`: Belum submit
  - `pending_approval`: Menunggu admin
  - `active`: Berjalan, menerima donasi
  - `ended`: Selesai
  - `frozen`: Dibekukan admin

#### FR-CAMP-005: Campaign Updates

- Organization dapat posting update progress
- Update berisi:
  - Judul update
  - Konten/deskripsi
  - Multiple images (optional)
  - Timestamp otomatis
- Update visible untuk semua user

### 4.4 Donation System

#### FR-DON-001: Make Donation

- User connect Web3 wallet (MetaMask/WalletConnect)
- Pilih kampanye active
- Input amount (min 0.001 ETH)
- Optional: pesan untuk organisasi
- Transaksi via smart contract
- Donasi tercatat di blockchain

#### FR-DON-002: Donation Tracking

- User dapat melihat riwayat donasi
- Data dari blockchain:
  - Campaign yang didonasi
  - Amount
  - Timestamp
  - Transaction hash
  - Status konfirmasi

#### FR-DON-003: Anonymous Donation

- User dapat donasi tanpa login
- Hanya perlu Web3 wallet
- Tidak tercatat di database, hanya blockchain

### 4.5 Fund Distribution

#### FR-DIST-001: Withdraw Funds (Organization)

- Organization dapat tarik dana dari kampanye
- Required:
  - Amount (max = balance kampanye)
  - Deskripsi penggunaan dana
- Transaksi tercatat di blockchain
- Withdrawal history visible untuk transparansi

#### FR-DIST-002: Withdrawal Validation

- Validasi balance cukup
- Tidak dapat withdraw jika campaign frozen
- Withdrawal tercatat dengan timestamp
- Transaction hash tersimpan

### 4.6 Transparency & Reporting

#### FR-TRANS-001: Public Transparency Page

- Semua user dapat akses halaman transparansi
- Menampilkan:
  - Total donasi platform
  - Total kampanye
  - Total organisasi
  - Recent transactions (real-time dari blockchain)

#### FR-TRANS-002: Campaign Transparency

- Detail kampanye menampilkan:
  - Progress bar (collected/target)
  - Jumlah donatur
  - List donasi (address, amount, timestamp)
  - List withdrawal (amount, description, timestamp)
  - Blockchain verification link

#### FR-TRANS-003: Transaction History

- Semua transaksi tercatat di blockchain
- User dapat verify via Etherscan
- Data immutable dan transparent

### 4.7 Admin Dashboard

#### FR-ADMIN-001: Dashboard Overview

- Statistik platform:
  - Total users, organizations, campaigns
  - Total raised, total donors
  - Pending approvals count
  - Recent activities

#### FR-ADMIN-002: Organization Management

- List semua organisasi dengan filter:
  - All, Pending, Approved, Rejected, Banned
- Bulk actions support
- Search dan sort functionality

#### FR-ADMIN-003: Campaign Management

- List semua kampanye dengan filter
- Review pending campaigns
- Freeze/unfreeze campaigns
- View blockchain data

#### FR-ADMIN-004: Transaction Monitoring

- Real-time monitoring transaksi blockchain
- Filter by type (donation/withdrawal)
- Export to CSV
- Anomaly detection

#### FR-ADMIN-005: Blockchain Management

- View factory contract info
- Monitor gas usage
- Emergency freeze campaigns
- Contract upgrade management

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

- **NFR-PERF-001**: Page load time < 3 detik
- **NFR-PERF-002**: Blockchain transaction confirmation < 30 detik (Sepolia)
- **NFR-PERF-003**: Support 1000+ concurrent users
- **NFR-PERF-004**: Database query response < 500ms

### 5.2 Security

- **NFR-SEC-001**: HTTPS untuk semua komunikasi
- **NFR-SEC-002**: Password hashing dengan bcrypt
- **NFR-SEC-003**: JWT token expiration 24 jam
- **NFR-SEC-004**: Input validation dan sanitization
- **NFR-SEC-005**: Smart contract audit sebelum production
- **NFR-SEC-006**: Rate limiting untuk API endpoints
- **NFR-SEC-007**: File upload validation (type, size)

### 5.3 Reliability

- **NFR-REL-001**: System uptime 99.5%
- **NFR-REL-002**: Database backup daily
- **NFR-REL-003**: Error logging dan monitoring
- **NFR-REL-004**: Graceful error handling

### 5.4 Usability

- **NFR-USE-001**: Responsive design (mobile, tablet, desktop)
- **NFR-USE-002**: Accessible (WCAG 2.1 Level AA)
- **NFR-USE-003**: Multi-language support (ID, EN)
- **NFR-USE-004**: Intuitive UI/UX
- **NFR-USE-005**: Loading states untuk async operations

### 5.5 Scalability

- **NFR-SCAL-001**: Horizontal scaling support
- **NFR-SCAL-002**: CDN untuk static assets
- **NFR-SCAL-003**: Database indexing untuk query optimization
- **NFR-SCAL-004**: Caching strategy (Redis/Vercel Edge)

---

## 6. DATABASE SCHEMA

### 6.1 Core Tables

#### profiles

```sql
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text)
- avatar_url (text)
- wallet_address (text, unique)
- role (enum: user, org, admin)
- bio (text)
- phone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### organizations

```sql
- id (uuid, PK, FK to profiles)
- name (text, unique)
- description (text)
- phone (text)
- address (text)
- website (text)
- image_url (text)
- ktp_url (text)
- legal_doc_url (text)
- is_verified (boolean)
- status (enum: pending, approved, rejected)
- verified_at (timestamp)
- verified_by (uuid, FK to profiles)
- rejection_reason (text)
- is_banned (boolean)
- banned_at (timestamp)
- banned_by (uuid, FK to profiles)
- ban_reason (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### campaigns

```sql
- id (uuid, PK)
- creator_id (uuid, FK to profiles)
- title (text)
- description (text)
- category (enum)
- image_url (text)
- target_amount (numeric)
- contract_address (text, unique)
- status (enum: draft, pending_approval, active, ended, frozen)
- start_date (timestamp)
- end_date (timestamp)
- approved_at (timestamp)
- approved_by (uuid, FK to profiles)
- rejection_reason (text)
- is_frozen (boolean)
- frozen_at (timestamp)
- frozen_by (uuid, FK to profiles)
- freeze_reason (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### campaign_updates

```sql
- id (uuid, PK)
- campaign_id (uuid, FK to campaigns)
- title (text)
- content (text)
- created_by (uuid, FK to profiles)
- created_at (timestamp)
```

#### campaign_update_images

```sql
- id (uuid, PK)
- campaign_update_id (uuid, FK to campaign_updates)
- image_url (text)
- display_order (integer)
- created_at (timestamp)
```

#### admin_actions

```sql
- id (uuid, PK)
- admin_id (uuid, FK to profiles)
- action_type (text)
- target_type (enum: organization, campaign, user)
- target_id (uuid)
- details (jsonb)
- created_at (timestamp)
```

### 6.2 Relationships

- `profiles` 1:1 `organizations`
- `profiles` 1:N `campaigns` (creator)
- `campaigns` 1:N `campaign_updates`
- `campaign_updates` 1:N `campaign_update_images`
- `profiles` 1:N `admin_actions` (admin)

### 6.3 Indexes

- `profiles.wallet_address`
- `campaigns.contract_address`
- `campaigns.status`
- `campaigns.creator_id`
- `organizations.status`

---

## 7. SMART CONTRACT SPECIFICATION

### 7.1 CampaignFactory Contract

#### State Variables

```solidity
address[] public deployedCampaigns
mapping(address => address[]) public organizationCampaigns
address public admin
```

#### Functions

- `createCampaign()`: Deploy campaign baru
- `getAllCampaigns()`: Get semua campaign addresses
- `getOrganizationCampaigns()`: Get campaigns by organization
- `getCampaignCount()`: Total campaigns
- `changeAdmin()`: Update admin address

#### Events

- `CampaignCreated(address, address, string, uint256, uint256)`
- `AdminChanged(address, address)`

### 7.2 Campaign Contract

#### Structs

```solidity
struct Donation {
    address donor;
    uint256 amount;
    uint256 timestamp;
    string message;
}

struct Withdrawal {
    uint256 amount;
    string description;
    address recipient;
    uint256 timestamp;
    bool completed;
}

struct CampaignUpdate {
    string title;
    string content;
    uint256 timestamp;
}
```

#### State Variables

```solidity
address public organization
string public title, description, category
uint256 public targetAmount, collectedAmount, deadline
bool public isActive, isFrozen
Donation[] public donations
Withdrawal[] public withdrawals
CampaignUpdate[] public updates
```

#### Functions

- `donate(string memory _message)`: Terima donasi
- `withdraw(uint256 _amount, string memory _description)`: Tarik dana
- `postUpdate(string memory _title, string memory _content)`: Post update
- `endCampaign()`: End campaign
- `reactivateCampaign()`: Reactivate campaign
- `freezeCampaign()`: Freeze (admin only)
- `unfreezeCampaign()`: Unfreeze (admin only)
- `getSummary()`: Get campaign data
- `getAllDonations()`: Get all donations
- `getAllWithdrawals()`: Get all withdrawals
- `getProgressPercentage()`: Calculate progress

#### Events

- `DonationReceived(address, uint256, string, uint256)`
- `WithdrawalMade(address, uint256, string, uint256)`
- `CampaignUpdated(string, string, uint256)`
- `CampaignStatusChanged(bool, uint256)`
- `CampaignFrozen(uint256)`
- `CampaignUnfrozen(uint256)`

---

## 8. API ENDPOINTS

### 8.1 Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

### 8.2 Organizations

- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization detail
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `POST /api/organizations/:id/approve` - Approve (admin)
- `POST /api/organizations/:id/reject` - Reject (admin)
- `POST /api/organizations/:id/ban` - Ban (admin)

### 8.3 Campaigns

- `GET /api/campaigns` - List campaigns (public)
- `GET /api/campaigns/:id` - Get campaign detail
- `POST /api/campaigns` - Create campaign (org)
- `PUT /api/campaigns/:id` - Update campaign (org)
- `POST /api/campaigns/:id/approve` - Approve (admin)
- `POST /api/campaigns/:id/reject` - Reject (admin)
- `POST /api/campaigns/:id/freeze` - Freeze (admin)
- `POST /api/campaigns/:id/updates` - Create update (org)

### 8.4 Blockchain

- `GET /api/blockchain/campaigns/:address` - Get blockchain data
- `GET /api/blockchain/donations/:address` - Get donations
- `GET /api/blockchain/withdrawals/:address` - Get withdrawals
- `GET /api/blockchain/stats` - Platform statistics

---

## 9. USER INTERFACE REQUIREMENTS

### 9.1 Public Pages

- **Homepage**: Hero, featured campaigns, stats, how it works
- **Campaigns List**: Grid/list view, filters, search, pagination
- **Campaign Detail**: Progress, donations, withdrawals, updates
- **Transparency**: Platform stats, recent transactions
- **Organization Profile**: Public view, campaigns list

### 9.2 User Dashboard

- **Profile**: Edit profile, wallet connection
- **History**: Donation history, transaction details
- **Donate**: Campaign selection, amount input, Web3 transaction

### 9.3 Organization Dashboard

- **Dashboard**: Stats, recent activities
- **Campaigns**: List, create, edit, view details
- **Campaign Detail**: Donations, withdrawals, post updates
- **Distributions**: Withdraw funds, history
- **Profile**: Edit organization info
- **Transactions**: Donation & withdrawal history

### 9.4 Admin Dashboard

- **Dashboard**: Platform overview, stats
- **Organizations**: List, pending, approve/reject, ban
- **Campaigns**: List, pending, approve/reject, freeze
- **Transactions**: Monitor all blockchain transactions
- **Blockchain**: Factory contract info, emergency controls
- **Settings**: Platform configuration

### 9.5 Design Requirements

- Modern, clean, professional design
- Consistent color scheme (primary, secondary, accent)
- Responsive breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Dark mode support
- Loading states untuk semua async operations
- Error states dengan user-friendly messages
- Success notifications (toast/modal)

---

## 10. INTEGRATION REQUIREMENTS

### 10.1 Web3 Integration

- RainbowKit untuk wallet connection
- Support wallets: MetaMask, WalletConnect, Coinbase Wallet
- Network: Sepolia testnet (development), Ethereum mainnet (production)
- Auto-switch network jika user di network salah
- Transaction confirmation handling
- Gas estimation

### 10.2 Supabase Integration

- Authentication dengan email/password
- Row Level Security (RLS) policies
- Storage untuk file uploads (images, documents)
- Real-time subscriptions untuk updates
- Edge functions untuk server-side logic

### 10.3 External Services

- Email service untuk notifications (Supabase Auth)
- Image optimization (Next.js Image)
- Analytics (Vercel Analytics)

---

## 11. TESTING REQUIREMENTS

### 11.1 Unit Testing

- Smart contract functions (Hardhat/Foundry)
- Utility functions
- Form validations
- API endpoints

### 11.2 Integration Testing

- Authentication flow
- Campaign creation flow
- Donation flow
- Withdrawal flow
- Admin approval flow

### 11.3 E2E Testing

- User journey: Register → Donate
- Organization journey: Register → Create Campaign → Withdraw
- Admin journey: Approve Organization → Approve Campaign

### 11.4 Smart Contract Testing

- Donation functionality
- Withdrawal functionality
- Access control
- Edge cases (overflow, underflow)
- Gas optimization

---

## 12. DEPLOYMENT REQUIREMENTS

### 12.1 Frontend Deployment

- Platform: Vercel
- Environment: Production, Staging, Development
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_FACTORY_ADDRESS`
  - `NEXT_PUBLIC_CHAIN_ID`

### 12.2 Smart Contract Deployment

- Network: Sepolia (testnet), Ethereum (mainnet)
- Deployment tool: Hardhat/Foundry
- Verification: Etherscan
- Backup private keys securely

### 12.3 Database Deployment

- Supabase project setup
- Migration scripts
- RLS policies
- Backup strategy

---

## 13. MAINTENANCE & SUPPORT

### 13.1 Monitoring

- Application performance monitoring (Vercel)
- Error tracking (Sentry/LogRocket)
- Blockchain transaction monitoring
- Database performance monitoring

### 13.2 Logging

- Application logs (errors, warnings, info)
- User activity logs
- Admin action logs
- Blockchain transaction logs

### 13.3 Backup & Recovery

- Database backup: Daily automated
- File storage backup: Weekly
- Smart contract code backup: Version control (Git)
- Recovery time objective (RTO): 4 hours
- Recovery point objective (RPO): 24 hours

---

## 14. FUTURE ENHANCEMENTS

### 14.1 Phase 2 Features

- Multi-currency support (USDT, USDC, DAI)
- Recurring donations
- Campaign milestones dengan automated fund release
- NFT rewards untuk donors
- Social sharing integration
- Campaign comments/reviews

### 14.2 Phase 3 Features

- Mobile app (React Native)
- AI-powered fraud detection
- Decentralized governance (DAO)
- Cross-chain support (Polygon, BSC)
- Advanced analytics dashboard
- API untuk third-party integration

---

## 15. CONSTRAINTS & ASSUMPTIONS

### 15.1 Constraints

- Budget terbatas untuk gas fees (gunakan testnet untuk development)
- Blockchain transaction tidak bisa di-rollback
- Supabase free tier limitations
- Browser harus support Web3 (MetaMask extension)

### 15.2 Assumptions

- User memiliki basic knowledge tentang cryptocurrency
- User memiliki Web3 wallet untuk donasi
- Organization memiliki dokumen legal yang valid
- Admin melakukan verifikasi manual untuk organization
- Internet connection stabil untuk blockchain transactions

---

## 16. GLOSSARY

- **Blockchain**: Distributed ledger technology
- **Smart Contract**: Self-executing contract pada blockchain
- **Web3**: Decentralized web menggunakan blockchain
- **Wallet**: Digital wallet untuk cryptocurrency
- **Gas Fee**: Biaya transaksi di Ethereum network
- **Testnet**: Blockchain network untuk testing
- **Mainnet**: Production blockchain network
- **RLS**: Row Level Security di PostgreSQL
- **SSR**: Server-Side Rendering
- **CSR**: Client-Side Rendering

---

## APPENDIX A: CAMPAIGN CATEGORIES

1. **Kesehatan** - Medical treatment, hospital bills, medical equipment
2. **Pendidikan** - Scholarships, school facilities, educational programs
3. **Bencana Alam** - Natural disaster relief, emergency aid
4. **Lingkungan** - Environmental conservation, reforestation
5. **Sosial** - Community development, poverty alleviation
6. **Ekonomi** - Small business support, economic empowerment
7. **Lainnya** - Other charitable causes

---

## APPENDIX B: USER FLOWS

### B.1 Donation Flow

1. User browse campaigns (public)
2. User click "Donate" pada campaign
3. System check wallet connection
4. If not connected → prompt wallet connection
5. User input donation amount
6. User (optional) input message
7. User confirm transaction di wallet
8. Smart contract process donation
9. System show success message
10. Donation tercatat di blockchain

### B.2 Campaign Creation Flow

1. Organization login
2. Navigate to "Create Campaign"
3. Fill campaign form (title, description, target, duration, image)
4. Submit campaign
5. System validate data
6. System deploy smart contract
7. Campaign status → pending_approval
8. Admin review campaign
9. Admin approve/reject
10. If approved → status active, organization notified
11. Campaign ready menerima donasi

### B.3 Organization Approval Flow

1. User register sebagai organization
2. Fill organization form + upload documents
3. Submit registration
4. Status → pending
5. Admin receive notification
6. Admin review documents
7. Admin approve/reject dengan reason
8. Organization receive email notification
9. If approved → can create campaigns
10. If rejected → can re-submit dengan perbaikan

---

**END OF DOCUMENT**
