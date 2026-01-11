# 🚀 Panduan Deploy Smart Contract ChainAid

## 📋 Prerequisites

1. **MetaMask** terinstall di browser
2. **Sepolia ETH** untuk gas fees (bisa dapat dari faucet)
3. **Infura/Alchemy Account** untuk RPC URL (opsional, bisa pakai public RPC)

---

## 🔧 Step 1: Compile Smart Contract di Remix

### 1.1 Buka Remix IDE

- Buka https://remix.ethereum.org

### 1.2 Create New File

- Klik "contracts" folder
- Create file: `ChainAid.sol`
- Copy-paste isi dari `contracts/ChainAid.sol` di project ini

### 1.3 Compile Contract

- Klik tab "Solidity Compiler" (icon compile di sidebar)
- Pilih compiler version: `0.8.20`
- Klik "Compile ChainAid.sol"
- ✅ Pastikan tidak ada error

---

## 🌐 Step 2: Deploy ke Sepolia Testnet

### 2.1 Setup MetaMask

- Switch network ke **Sepolia Testnet**
- Pastikan punya Sepolia ETH (minimal 0.1 ETH)
  - Faucet: https://sepoliafaucet.com
  - Atau: https://www.alchemy.com/faucets/ethereum-sepolia

### 2.2 Connect Remix ke MetaMask

- Klik tab "Deploy & Run Transactions"
- Environment: Pilih **"Injected Provider - MetaMask"**
- Account: Pastikan address MetaMask Anda muncul
- ✅ Confirm connection di MetaMask

### 2.3 Deploy CampaignFactory

- Contract: Pilih **"CampaignFactory"** (bukan Campaign!)
- Klik **"Deploy"**
- ✅ Confirm transaction di MetaMask
- ⏳ Tunggu transaction confirmed (~15-30 detik)

### 2.4 Copy Contract Address

- Setelah deploy sukses, lihat "Deployed Contracts" di bawah
- Klik copy icon untuk copy contract address
- **SIMPAN ADDRESS INI!** Format: `0x1234...abcd`

---

## 🔑 Step 3: Setup Environment Variables

### 3.1 Buat/Update `.env.local`

Di root project, buat file `.env.local` dengan isi:

```env
# Supabase (sudah ada)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Blockchain Configuration
NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect (opsional, untuk RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3.2 Ganti Placeholder

- `NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS`: Paste address dari Step 2.4
- `NEXT_PUBLIC_RPC_URL`:
  - **Opsi 1 (Recommended)**: Daftar di Infura.io → Create project → Copy RPC URL
  - **Opsi 2**: Gunakan public RPC: `https://rpc.sepolia.org`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`:
  - Daftar di https://cloud.walletconnect.com
  - Create project → Copy Project ID

---

## ✅ Step 4: Verify Deployment

### 4.1 Test di Remix

Di Remix, pada "Deployed Contracts":

- Expand contract yang baru di-deploy
- Klik `getCampaignCount` → Should return `0`
- Klik `admin` → Should return your wallet address
- ✅ Jika berfungsi, deployment sukses!

### 4.2 Verify di Etherscan

- Buka https://sepolia.etherscan.io
- Paste contract address di search
- ✅ Lihat contract details & transactions

---

## 🧪 Step 5: Test Create Campaign (Manual)

### 5.1 Test di Remix

Di Remix "Deployed Contracts":

- Expand `createCampaign` function
- Isi parameters:
  ```
  _title: "Test Campaign"
  _description: "Testing blockchain integration"
  _category: "pendidikan"
  _targetAmount: 1000000000000000000 (1 ETH in wei)
  _durationDays: 30
  ```
- Klik **"transact"**
- ✅ Confirm di MetaMask
- ⏳ Tunggu transaction confirmed

### 5.2 Verify Campaign Created

- Klik `getCampaignCount` → Should return `1`
- Klik `getAllCampaigns` → Should return array dengan 1 address
- Copy campaign address
- Klik `getOrganizationCampaigns` dengan your wallet address
- ✅ Should return campaign address

---

## 📝 Step 6: Update Code (Opsional - Nanti)

Setelah deploy sukses, kita akan:

1. Update `lib/blockchain.ts` untuk use environment variables
2. Update `create-campaign-form.tsx` untuk call blockchain
3. Test create campaign dari UI

---

## 🆘 Troubleshooting

### Error: "Insufficient funds"

- Tambah Sepolia ETH dari faucet

### Error: "Transaction failed"

- Check gas limit
- Pastikan parameters benar (targetAmount dalam wei, durationDays > 0)

### Contract tidak muncul di Etherscan

- Tunggu beberapa menit
- Refresh page
- Check transaction hash di MetaMask

### RPC Error

- Gunakan public RPC: `https://rpc.sepolia.org`
- Atau daftar Infura/Alchemy untuk RPC yang lebih reliable

---

## ✅ Checklist

- [ ] Smart contract compiled di Remix
- [ ] CampaignFactory deployed ke Sepolia
- [ ] Contract address disimpan
- [ ] `.env.local` sudah diupdate
- [ ] Test create campaign di Remix berhasil
- [ ] Contract verified di Etherscan
- [ ] Ready untuk integrasi ke UI!

---

## 📞 Next Steps

Setelah semua checklist ✅, kita akan:

1. Update `create-campaign-form.tsx` untuk integrasi blockchain
2. Test create campaign dari UI
3. Integrasi donation flow
4. Update transparency page dengan real blockchain data

**Selamat! Smart contract Anda sudah live di Sepolia Testnet! 🎉**
