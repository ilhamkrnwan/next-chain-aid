import { ethers } from 'ethers'
import type {
  Donation,
  Withdrawal,
  BlockchainCampaignData,
} from '@/lib/types'

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

export const CONTRACTS = {
  CAMPAIGN_FACTORY: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || '',
  CHAIN_ID: 11155111, // Sepolia testnet
  RPC_URLS: [
    'https://eth-sepolia.g.alchemy.com/v2/demo',
    process.env.NEXT_PUBLIC_RPC_URL || '',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
    process.env.NEXT_PUBLIC_RPC_URL_FALLBACK || '',
  ].filter(url => url && url.length > 0),
} as const

// ============================================================================
// ABI DEFINITIONS
// ============================================================================

export const CAMPAIGN_ABI = [
  'function getSummary() view returns (address, string, string, string, uint256, uint256, uint256, uint256, bool, bool, uint256, uint256)',
  'function getDonation(uint256) view returns (address, uint256, uint256, string)',
  'function getAllDonations() view returns (tuple(address donor, uint256 amount, uint256 timestamp, string message)[])',
  'function getWithdrawal(uint256) view returns (uint256, string, address, uint256, bool)',
  'function getAllWithdrawals() view returns (tuple(uint256 amount, string withdrawalDescription, address recipient, uint256 timestamp, bool completed)[])',
  'function getDonationCount() view returns (uint256)',
  'function getWithdrawalCount() view returns (uint256)',
  'function getDonorCount() view returns (uint256)',
  'function getBalance() view returns (uint256)',
  'function getTimeRemaining() view returns (uint256)',
  'function getProgressPercentage() view returns (uint256)',
  'function hasReachedTarget() view returns (bool)',
  'function hasEnded() view returns (bool)',
  'function donate(string) payable',
  'function withdraw(uint256, string)',
  'function postUpdate(string, string)',
  'event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp)',
  'event WithdrawalMade(address indexed recipient, uint256 amount, string description, uint256 timestamp)',
  'event CampaignUpdated(string title, string content, uint256 timestamp)',
] as const

export const CAMPAIGN_FACTORY_ABI = [
  'function createCampaign(string, string, string, uint256, uint256) returns (address)',
  'function getAllCampaigns() view returns (address[])',
  'function getOrganizationCampaigns(address) view returns (address[])',
  'function getCampaignCount() view returns (uint256)',
  'event CampaignCreated(address indexed campaignAddress, address indexed organization, string title, uint256 targetAmount, uint256 timestamp)',
] as const

// ============================================================================
// PROVIDER & SIGNER (RUNTIME SAFE)
// ============================================================================

export function getReadProvider(): ethers.Provider {
  if (typeof window === 'undefined') {
    return new ethers.JsonRpcProvider(CONTRACTS.RPC_URLS[0])
  }

  if (!window.ethereum) {
    throw new Error('Wallet tidak tersedia')
  }

  return new ethers.BrowserProvider(window.ethereum)
}

export async function getSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask tidak terpasang')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider.getSigner()
}

export async function isWalletConnected(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const accounts = await provider.listAccounts()
  return accounts.length > 0
}

// ============================================================================
// CONTRACT HELPERS
// ============================================================================

export function getCampaignContract(
  contractAddress: string,
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const providerOrSigner = signerOrProvider ?? getReadProvider()
  return new ethers.Contract(contractAddress, CAMPAIGN_ABI, providerOrSigner)
}

export function getFactoryContract(
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const providerOrSigner = signerOrProvider ?? getReadProvider()
  return new ethers.Contract(
    CONTRACTS.CAMPAIGN_FACTORY,
    CAMPAIGN_FACTORY_ABI,
    providerOrSigner
  )
}

// ============================================================================
// READ FUNCTIONS
// ============================================================================

export async function getCampaignSummary(
  contractAddress: string
): Promise<BlockchainCampaignData> {
  const contract = getCampaignContract(contractAddress)

  const [
    organization,
    title,
    description,
    category,
    targetAmount,
    collectedAmount,
    balance,
    deadline,
    isActive,
    isFrozen,
    donationCount,
    donorCount,
  ] = await contract.getSummary()

  return {
    organization,
    title,
    description,
    category,
    targetAmount,
    collectedAmount,
    balance,
    deadline: Number(deadline),
    isActive,
    isFrozen,
    donationCount: Number(donationCount),
    donorCount: Number(donorCount),
  }
}

export async function getCampaignDonations(
  contractAddress: string
): Promise<Donation[]> {
  const contract = getCampaignContract(contractAddress)
  const donations = await contract.getAllDonations()

  return donations.map((d: any) => ({
    donor: d.donor,
    amount: d.amount,
    timestamp: Number(d.timestamp),
    message: d.message,
  }))
}

export async function getCampaignWithdrawals(
  contractAddress: string
): Promise<Withdrawal[]> {
  const contract = getCampaignContract(contractAddress)
  const withdrawals = await contract.getAllWithdrawals()

  return withdrawals.map((w: any) => ({
    amount: w.amount,
    description: w.withdrawalDescription || w.description,
    recipient: w.recipient,
    timestamp: Number(w.timestamp),
    completed: w.completed,
  }))
}

export async function getAllBlockchainCampaigns(): Promise<string[]> {
  const factory = getFactoryContract()
  return factory.getAllCampaigns()
}

export async function getOrganizationBlockchainCampaigns(
  orgAddress: string
): Promise<string[]> {
  const factory = getFactoryContract()
  return factory.getOrganizationCampaigns(orgAddress)
}

// ============================================================================
// WRITE FUNCTIONS (CLIENT ONLY)
// ============================================================================

export async function donateToCampaign(
  contractAddress: string,
  amount: string,
  message: string = ''
): Promise<ethers.TransactionReceipt> {
  const signer = await getSigner()
  const contract = getCampaignContract(contractAddress, signer)

  const tx = await contract.donate(message, {
    value: ethers.parseEther(amount),
  })

  return tx.wait()
}

export async function withdrawFromCampaign(
  contractAddress: string,
  amount: string,
  description: string
): Promise<ethers.TransactionReceipt> {
  const signer = await getSigner()
  const contract = getCampaignContract(contractAddress, signer)

  const tx = await contract.withdraw(
    ethers.parseEther(amount),
    description
  )

  return tx.wait()
}

export async function postCampaignUpdate(
  contractAddress: string,
  title: string,
  content: string
): Promise<ethers.TransactionReceipt> {
  const signer = await getSigner()
  const contract = getCampaignContract(contractAddress, signer)

  const tx = await contract.postUpdate(title, content)
  return tx.wait()
}

export async function createBlockchainCampaign(
  title: string,
  description: string,
  category: string,
  targetAmount: string,
  durationDays: number
): Promise<{ contractAddress: string; receipt: ethers.TransactionReceipt }> {
  if (!CONTRACTS.CAMPAIGN_FACTORY) {
    throw new Error('Campaign Factory address belum dikonfigurasi')
  }

  const signer = await getSigner()
  const factory = getFactoryContract(signer)

  const tx = await factory.createCampaign(
    title,
    description,
    category,
    ethers.parseEther(targetAmount),
    durationDays
  )

  const receipt = await tx.wait()

  const eventLog = receipt.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog(log)
      return parsed?.name === 'CampaignCreated'
    } catch {
      return false
    }
  })

  if (!eventLog) {
    throw new Error('CampaignCreated event tidak ditemukan')
  }

const parsedEvent = factory.interface.parseLog(eventLog)

if (!parsedEvent) {
  throw new Error('Gagal mem-parse event CampaignCreated')
}

const contractAddress = parsedEvent.args[0]


  return { contractAddress, receipt }
}

// ============================================================================
// EVENT LISTENERS (CLIENT – WALLET PROVIDER)
// ============================================================================

export function listenToDonations(
  contractAddress: string,
  callback: (donor: string, amount: bigint, message: string, timestamp: number) => void
): () => void {
  const contract = getCampaignContract(contractAddress)

  const listener = (
    donor: string,
    amount: bigint,
    message: string,
    timestamp: bigint
  ) => {
    callback(donor, amount, message, Number(timestamp))
  }

  contract.on('DonationReceived', listener)

  return () => {
    contract.off('DonationReceived', listener)
  }
}

export function listenToWithdrawals(
  contractAddress: string,
  callback: (recipient: string, amount: bigint, description: string, timestamp: number) => void
): () => void {
  const contract = getCampaignContract(contractAddress)

  const listener = (
    recipient: string,
    amount: bigint,
    description: string,
    timestamp: bigint
  ) => {
    callback(recipient, amount, description, Number(timestamp))
  }

  contract.on('WithdrawalMade', listener)

  return () => {
    contract.off('WithdrawalMade', listener)
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

export function weiToEth(wei: bigint | string): string {
  return ethers.formatEther(wei)
}

export function ethToWei(eth: string | number): bigint {
  return ethers.parseEther(eth.toString())
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDaysRemaining(deadline: number): number {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  return Math.max(0, Math.floor(remaining / 86400))
}

export function getProgressPercentage(
  collected: bigint,
  target: bigint
): number {
  if (target === BigInt(0)) return 0
  const percentage = (Number(collected) * 100) / Number(target)
  return Math.min(100, Math.round(percentage))
}

// ============================================================================
// GLOBAL TYPE
// ============================================================================

declare global {
  interface Window {
    ethereum?: any
  }
}
