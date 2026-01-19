# ChainAid - Platform Donasi Transparan Berbasis Blockchain

![ChainAid Logo](./public/logo.png)

## 📖 Deskripsi

**ChainAid** adalah platform manajemen campaign dan donasi yang memanfaatkan teknologi blockchain untuk memastikan transparansi dan akuntabilitas penuh dalam setiap transaksi donasi. Platform ini menggabungkan kekuatan **Next.js 16**, **Supabase**, dan **Ethereum Smart Contracts** untuk menciptakan ekosistem donasi yang aman, terdesentralisasi, dan dapat dipercaya.

### 🎯 Misi ChainAid

Menciptakan ekosistem donasi yang transparan dan dapat dipercaya dengan memanfaatkan teknologi blockchain, sehingga setiap donasi dapat dilacak secara real-time dan dipertanggungjawabkan sepenuhnya kepada para donatur.

## ✨ Fitur Utama

### 🔐 Transparansi Blockchain

- **Smart Contract Integration**: Semua transaksi donasi dan penarikan dana tercatat di blockchain Ethereum (Sepolia Testnet)
- **Real-time Tracking**: Donatur dapat melacak penggunaan dana secara real-time
- **Immutable Records**: Catatan transaksi tidak dapat diubah atau dimanipulasi
- **Wallet Integration**: Koneksi dengan MetaMask untuk transaksi yang aman

### 👥 Multi-Role System

Platform mendukung 3 jenis pengguna dengan hak akses berbeda:

1. **User (Donatur)**
   - Melihat dan mencari campaign
   - Melakukan donasi menggunakan cryptocurrency (ETH)
   - Melihat riwayat donasi pribadi
   - Tracking transparansi penggunaan dana

2. **Organization (Organisasi)**
   - Membuat dan mengelola campaign donasi
   - Menarik dana dari campaign yang berhasil
   - Posting update campaign untuk donatur
   - Melihat statistik dan laporan campaign
   - Mengelola profil organisasi

3. **Admin (Administrator)**
   - Verifikasi dan approval organisasi
   - Monitoring semua campaign
   - Freeze/unfreeze campaign yang melanggar
   - Ban/unban organisasi
   - Akses ke dashboard analytics
   - Generate laporan PDF organisasi

### 📊 Campaign Management

- **Campaign Creation**: Organisasi dapat membuat campaign dengan target dana dan deadline
- **Category System**: Kategorisasi campaign (Kesehatan, Pendidikan, Bencana Alam, dll)
- **Status Tracking**: Draft → Pending Approval → Active → Ended
- **Campaign Updates**: Organisasi dapat posting update progress kepada donatur
- **Image Gallery**: Upload multiple images untuk campaign dan updates

### 💰 Donation & Withdrawal System

- **Crypto Donations**: Donasi menggunakan ETH melalui MetaMask
- **Donation Messages**: Donatur dapat meninggalkan pesan dukungan
- **Withdrawal Management**: Organisasi dapat menarik dana dengan deskripsi penggunaan
- **Balance Tracking**: Monitoring real-time saldo campaign dari blockchain

### 📈 Analytics & Reporting

- **Dashboard Statistics**: Statistik lengkap untuk admin dan organisasi
- **Transaction History**: Riwayat lengkap donasi dan penarikan dana
- **PDF Reports**: Generate laporan organisasi profesional (dapat di-disable)
- **Blockchain Verification**: Verifikasi data langsung dari smart contract

## 🏗️ Arsitektur Sistem

### Tech Stack

#### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4 + Radix UI Components
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod Validation
- **Charts**: Recharts
- **Notifications**: Sonner (Toast)

#### Backend & Database

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (untuk images dan documents)
- **Row Level Security**: Implementasi RLS policies untuk keamanan data

#### Blockchain

- **Network**: Ethereum Sepolia Testnet
- **Smart Contracts**: Solidity (ChainAid.sol)
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask SDK, RainbowKit, Wagmi
- **Contract Factory**: Deployment otomatis campaign contracts

#### Additional Services

- **FastAPI Integration**: Python backend untuk advanced analytics (optional)
- **PDF Generation**: jsPDF + autoTable untuk laporan

### Struktur Folder

```
next-chain-aid/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (client)/                 # Public user pages
│   │   ├── campaigns/            # Browse campaigns
│   │   ├── donate/               # Donation flow
│   │   ├── history/              # Donation history
│   │   ├── profile/              # User profile
│   │   ├── register-org/         # Organization registration
│   │   └── transparansi/         # Transparency page
│   ├── admin/                    # Admin dashboard
│   │   ├── blockchain/           # Blockchain management
│   │   ├── campaign/             # Campaign management
│   │   ├── organisasi/           # Organization management
│   │   ├── settings/             # Admin settings
│   │   └── transaksi/            # Transaction monitoring
│   ├── org/                      # Organization dashboard
│   │   ├── campaigns/            # Manage campaigns
│   │   ├── distributions/        # Fund distributions
│   │   ├── profile/              # Org profile
│   │   └── transactions/         # Transaction history
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Radix UI components
│   ├── admin/                    # Admin-specific components
│   ├── campaign/                 # Campaign components
│   ├── donation/                 # Donation components
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries
│   ├── api.ts                    # Supabase API functions
│   ├── blockchain.ts             # Blockchain interactions
│   ├── blockchain-helpers.ts     # Blockchain utilities
│   ├── blockchain-cache.ts       # Blockchain data caching
│   ├── admin-blockchain.ts       # Admin blockchain functions
│   ├── admin-blockchain-actions.ts
│   ├── fastapi.ts                # FastAPI integration
│   ├── pdf-generator.ts          # PDF report generation
│   ├── storage-helpers.ts        # Supabase storage utilities
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # General utilities
│   └── supabase/                 # Supabase client setup
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── contracts/                    # Smart contracts
│   └── ChainAid.sol              # Main campaign contract
├── public/                       # Static assets
│   ├── logo.png
│   └── logo.ico
├── styles/                       # Additional styles
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🗄️ Database Schema

### Tables

#### `profiles`

- User profile information
- Roles: `user`, `org`, `admin`
- Wallet address integration

#### `organizations`

- Organization details
- Verification status: `pending`, `approved`, `rejected`
- Ban management
- Document storage (KTP, Legal docs)

#### `campaigns`

- Campaign information
- Status: `draft`, `pending_approval`, `active`, `ended`, `frozen`
- Blockchain contract address
- Target amount and dates

#### `campaign_updates`

- Campaign progress updates
- Posted by organization

#### `campaign_update_images`

- Multiple images per update

#### `admin_actions`

- Audit log for admin activities

### Storage Buckets

- `avatars`: User profile pictures
- `campaigns`: Campaign images
- `documents`: Legal documents (KTP, organization docs)

## 🔗 Smart Contract Architecture

### CampaignFactory Contract

- Deploy new campaign contracts
- Track all campaigns
- Organization campaign mapping

### Campaign Contract (Individual)

**State Variables:**

- Organization address
- Campaign details (title, description, category)
- Target amount & deadline
- Collected amount & balance
- Active/frozen status

**Functions:**

- `donate(message)`: Accept donations with optional message
- `withdraw(amount, description)`: Withdraw funds (organization only)
- `postUpdate(title, content)`: Post campaign updates
- `getSummary()`: Get campaign overview
- `getAllDonations()`: Get all donation records
- `getAllWithdrawals()`: Get all withdrawal records

**Events:**

- `DonationReceived`: Emitted on new donation
- `WithdrawalMade`: Emitted on fund withdrawal
- `CampaignUpdated`: Emitted on new update

## 🚀 Instalasi & Setup

### Prerequisites

- Node.js 18+ dan npm/pnpm
- MetaMask wallet extension
- Supabase account
- Ethereum Sepolia testnet ETH (untuk testing)

### 1. Clone Repository

```bash
git clone https://github.com/ilhamkrnwan/next-chain-aid.git
cd next-chain-aid
```

### 2. Install Dependencies

```bash
npm install
# atau
pnpm install
```

### 3. Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain Configuration
NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=your_campaign_factory_address
NEXT_PUBLIC_RPC_URL=your_rpc_url
NEXT_PUBLIC_CHAIN_ID=11155111

# FastAPI Configuration (Optional)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### 4. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan migration SQL dari folder `migrations/`
3. Setup storage buckets: `avatars`, `campaigns`, `documents`
4. Configure RLS policies sesuai kebutuhan

### 5. Deploy Smart Contract

1. Deploy `CampaignFactory` contract ke Sepolia testnet
2. Copy contract address ke `.env.local`
3. Verify contract di Etherscan (optional)

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📱 User Flow

### Untuk Donatur (User)

1. **Register/Login** → Buat akun atau login
2. **Browse Campaigns** → Lihat campaign yang tersedia
3. **Connect Wallet** → Hubungkan MetaMask wallet
4. **Donate** → Pilih campaign dan donasi dengan ETH
5. **Track** → Lihat riwayat donasi dan transparansi penggunaan dana

### Untuk Organisasi

1. **Register Organization** → Daftar sebagai organisasi
2. **Verification** → Tunggu approval dari admin
3. **Create Campaign** → Buat campaign dengan detail lengkap
4. **Approval** → Tunggu campaign di-approve admin
5. **Deployment** → Campaign otomatis deploy ke blockchain
6. **Manage** → Kelola campaign, post updates, withdraw funds
7. **Report** → Lihat statistik dan laporan

### Untuk Admin

1. **Login as Admin** → Akses admin dashboard
2. **Verify Organizations** → Review dan approve/reject organisasi
3. **Monitor Campaigns** → Pantau semua campaign
4. **Moderate** → Freeze campaign atau ban organisasi jika melanggar
5. **Analytics** → Lihat statistik platform secara keseluruhan

## 🔒 Keamanan

### Blockchain Security

- Smart contract audited patterns
- Reentrancy protection
- Access control (only organization can withdraw)
- Immutable transaction records

### Application Security

- Supabase Row Level Security (RLS)
- Role-based access control (RBAC)
- Secure file upload validation
- Environment variable protection
- HTTPS only in production

### Authentication

- Supabase Auth dengan email verification
- Wallet signature verification
- Session management
- Protected routes dengan middleware

## 🧪 Testing

### Manual Testing

1. Test user registration dan login
2. Test organization registration flow
3. Test campaign creation dan approval
4. Test donation dengan MetaMask
5. Test withdrawal process
6. Test admin moderation features

### Blockchain Testing

- Test di Sepolia testnet sebelum mainnet
- Verify contract functions di Etherscan
- Test dengan multiple wallets
- Monitor gas fees

## 🚢 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables di Vercel

Tambahkan semua environment variables dari `.env.local` ke Vercel dashboard.

### Database Migration

Pastikan semua migration SQL sudah dijalankan di Supabase production.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Ilham Kurniawan**

- GitHub: [@ilhamkrnwan](https://github.com/ilhamkrnwan)
- Email: support@chainaid.id

## 🙏 Acknowledgments

- Next.js team untuk framework yang luar biasa
- Supabase untuk backend infrastructure
- Ethereum community untuk blockchain technology
- Radix UI untuk component library
- Semua contributors dan supporters

## 📞 Support

Jika ada pertanyaan atau masalah:

- Email: support@chainaid.id
- GitHub Issues: [Create an issue](https://github.com/ilhamkrnwan/next-chain-aid/issues)

---

**ChainAid** - Transparansi dalam Setiap Donasi 💙🔗
