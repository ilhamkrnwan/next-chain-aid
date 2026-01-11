import { ethers } from 'ethers'
import type {
  Donation,
  Withdrawal,
  BlockchainCampaignData,
} from '@/lib/types'

// Contract addresses (update after deployment)
export const CONTRACTS = {
  CAMPAIGN_FACTORY: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || '',
  CHAIN_ID: 11155111, // Sepolia testnet
  // Multiple RPC providers for fallback (CORS-enabled for browser)
  RPC_URLS: [
    // Alchemy Public (CORS enabled)
    'https://eth-sepolia.g.alchemy.com/v2/demo',
    // Infura (if API key provided)
    process.env.NEXT_PUBLIC_RPC_URL || '',
    // Chainlist public RPCs (CORS enabled)
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
    // Fallback
    process.env.NEXT_PUBLIC_RPC_URL_FALLBACK || '',
  ].filter(url => url && url.length > 0), // Remove empty URLs
} as const

// ============================================================================
// ABI (Update after compiling in Remix)
// ============================================================================

// Minimal ABI for Campaign contract
export const CAMPAIGN_ABI = [
  // View functions
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
  
  // State changing functions
  'function donate(string) payable',
  'function withdraw(uint256, string)',
  'function postUpdate(string, string)',
  
  // Events
  'event DonationReceived(address indexed donor, uint256 amount, string message, uint256 timestamp)',
  'event WithdrawalMade(address indexed recipient, uint256 amount, string description, uint256 timestamp)',
  'event CampaignUpdated(string title, string content, uint256 timestamp)',
] as const

// Minimal ABI for CampaignFactory contract
export const CAMPAIGN_FACTORY_ABI = [
  'function createCampaign(string, string, string, uint256, uint256) returns (address)',
  'function getAllCampaigns() view returns (address[])',
  'function getOrganizationCampaigns(address) view returns (address[])',
  'function getCampaignCount() view returns (uint256)',
  'event CampaignCreated(address indexed campaignAddress, address indexed organization, string title, uint256 targetAmount, uint256 timestamp)',
] as const

// ============================================================================
// PROVIDER & SIGNER
// ============================================================================

/**
 * Get read-only provider with fallback mechanism
 */
export function getProvider(): ethers.JsonRpcProvider {
  // Try each RPC URL until one works
  for (const rpcUrl of CONTRACTS.RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      // Test connection
      provider.getBlockNumber().catch(() => {
        console.warn(`RPC ${rpcUrl} failed, trying next...`)
      })
      return provider
    } catch (error) {
      console.warn(`Failed to create provider with ${rpcUrl}:`, error)
      continue
    }
  }
  
  // Fallback to first URL if all fail
  return new ethers.JsonRpcProvider(CONTRACTS.RPC_URLS[0])
}

/**
 * Get signer from browser wallet (MetaMask)
 */
export async function getSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider.getSigner()
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const accounts = await provider.listAccounts()
  return accounts.length > 0
}

// ============================================================================
// CAMPAIGN CONTRACT FUNCTIONS
// ============================================================================

/**
 * Get campaign contract instance
 */
export function getCampaignContract(
  contractAddress: string,
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(contractAddress, CAMPAIGN_ABI, providerOrSigner)
}

/**
 * Get campaign summary from blockchain
 */
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

/**
 * Get all donations for a campaign
 */
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

/**
 * Get all withdrawals for a campaign
 */
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

/**
 * Donate to campaign
 */
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

/**
 * Withdraw from campaign (organization only)
 */
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

/**
 * Post campaign update (organization only)
 */
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

// ============================================================================
// CAMPAIGN FACTORY FUNCTIONS
// ============================================================================

/**
 * Get factory contract instance
 */
export function getFactoryContract(
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(
    CONTRACTS.CAMPAIGN_FACTORY,
    CAMPAIGN_FACTORY_ABI,
    providerOrSigner
  )
}

/**
 * Create new campaign on blockchain with retry mechanism
 */
export async function createBlockchainCampaign(
  title: string,
  description: string,
  category: string,
  targetAmount: string,
  durationDays: number
): Promise<{ contractAddress: string; receipt: ethers.TransactionReceipt }> {
  try {
    // Validate inputs
    if (!title || !description || !category) {
      throw new Error('Title, description, and category are required')
    }
    
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      throw new Error('Target amount must be greater than 0')
    }
    
    if (!durationDays || durationDays <= 0) {
      throw new Error('Duration must be greater than 0 days')
    }

    // Check if factory address is configured
    if (!CONTRACTS.CAMPAIGN_FACTORY) {
      throw new Error('Campaign Factory address not configured. Please set NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS in .env.local')
    }

    // Get signer
    const signer = await getSigner()
    const signerAddress = await signer.getAddress()
    console.log('Creating campaign from address:', signerAddress)
    
    // Get factory contract
    const factory = getFactoryContract(signer)
    console.log('Factory address:', CONTRACTS.CAMPAIGN_FACTORY)
    
    // Create campaign transaction
    console.log('Sending createCampaign transaction...')
    const tx = await factory.createCampaign(
      title,
      description,
      category,
      ethers.parseEther(targetAmount),
      durationDays
    )
    
    console.log('Transaction sent:', tx.hash)
    console.log('Waiting for confirmation...')
    
    // Wait for transaction with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 2 minutes')), 120000)
      )
    ])
    
    console.log('Transaction confirmed in block:', receipt.blockNumber)
    
    // Get campaign address from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = factory.interface.parseLog(log)
        return parsed?.name === 'CampaignCreated'
      } catch {
        return false
      }
    })
    
    if (!event) {
      throw new Error('CampaignCreated event not found in transaction receipt')
    }
    
    const parsedEvent = factory.interface.parseLog(event)
    const contractAddress = parsedEvent?.args[0]
    
    if (!contractAddress) {
      throw new Error('Failed to get campaign address from event')
    }
    
    console.log('Campaign deployed at:', contractAddress)
    
    return { contractAddress, receipt }
  } catch (error: any) {
    console.error('Error creating blockchain campaign:', error)
    
    // Provide user-friendly error messages
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user')
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for gas fee. Please add Sepolia ETH to your wallet.')
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('could not coalesce')) {
      throw new Error('Network connection error. Please check your internet connection and RPC provider.')
    }
    
    if (error.message?.includes('MetaMask not installed')) {
      throw new Error('Please install MetaMask to deploy campaigns')
    }
    
    if (error.message?.includes('Factory address not configured')) {
      throw error
    }
    
    // Re-throw with original message if no specific handling
    throw new Error(error.message || 'Failed to deploy campaign to blockchain')
  }
}

/**
 * Get all campaigns from factory
 */
export async function getAllBlockchainCampaigns(): Promise<string[]> {
  const factory = getFactoryContract()
  return factory.getAllCampaigns()
}

/**
 * Get campaigns by organization
 */
export async function getOrganizationBlockchainCampaigns(
  orgAddress: string
): Promise<string[]> {
  const factory = getFactoryContract()
  return factory.getOrganizationCampaigns(orgAddress)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert wei to ETH
 */
export function weiToEth(wei: bigint | string): string {
  return ethers.formatEther(wei)
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: string | number): bigint {
  return ethers.parseEther(eth.toString())
}

/**
 * Format address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format timestamp to date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate days remaining
 */
export function getDaysRemaining(deadline: number): number {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  return Math.max(0, Math.floor(remaining / 86400))
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(collected: bigint, target: bigint): number {
  if (target === BigInt(0)) return 0
  const percentage = (Number(collected) * 100) / Number(target)
  return Math.min(100, Math.round(percentage))
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Listen to donation events
 */
export function listenToDonations(
  contractAddress: string,
  callback: (donor: string, amount: bigint, message: string, timestamp: number) => void
): () => void {
  const contract = getCampaignContract(contractAddress)
  
  const listener = (donor: string, amount: bigint, message: string, timestamp: bigint) => {
    callback(donor, amount, message, Number(timestamp))
  }
  
  contract.on('DonationReceived', listener)
  
  // Return cleanup function
  return () => {
    contract.off('DonationReceived', listener)
  }
}

/**
 * Listen to withdrawal events
 */
export function listenToWithdrawals(
  contractAddress: string,
  callback: (recipient: string, amount: bigint, description: string, timestamp: number) => void
): () => void {
  const contract = getCampaignContract(contractAddress)
  
  const listener = (recipient: string, amount: bigint, description: string, timestamp: bigint) => {
    callback(recipient, amount, description, Number(timestamp))
  }
  
  contract.on('WithdrawalMade', listener)
  
  // Return cleanup function
  return () => {
    contract.off('WithdrawalMade', listener)
  }
}

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

declare global {
  interface Window {
    ethereum?: any
  }
}
