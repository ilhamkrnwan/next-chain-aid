import { ethers } from 'ethers'
import { getCampaignContract, getOrganizationBlockchainCampaigns, weiToEth } from './blockchain'
import type { Campaign } from './types'

/**
 * Organization blockchain statistics
 */
export interface OrganizationBlockchainStats {
  totalCampaigns: number
  totalRaised: number // in ETH
  totalDonors: number
  totalDonations: number
  availableBalance: number // in ETH
  totalWithdrawn: number // in ETH
}

/**
 * Get aggregated blockchain stats for an organization
 * Fetches data from all campaigns created by the organization
 */
export async function getOrganizationBlockchainStats(
  walletAddress: string,
  campaigns: Campaign[]
): Promise<OrganizationBlockchainStats> {
  try {
    // Filter campaigns that have contract addresses
    const deployedCampaigns = campaigns.filter(c => c.contract_address)

    if (deployedCampaigns.length === 0) {
      return {
        totalCampaigns: 0,
        totalRaised: 0,
        totalDonors: 0,
        totalDonations: 0,
        availableBalance: 0,
        totalWithdrawn: 0,
      }
    }

    // Fetch stats from each campaign
    const statsPromises = deployedCampaigns.map(async (campaign) => {
      try {
        const contract = getCampaignContract(campaign.contract_address!)
        
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
          collectedAmount: Number(weiToEth(collectedAmount)),
          balance: Number(weiToEth(balance)),
          donorCount: Number(donorCount),
          donationCount: Number(donationCount),
        }
      } catch (error) {
        console.error(`Error fetching stats for campaign ${campaign.id}:`, error)
        return {
          collectedAmount: 0,
          balance: 0,
          donorCount: 0,
          donationCount: 0,
        }
      }
    })

    const campaignStats = await Promise.all(statsPromises)

    // Aggregate stats
    const totalRaised = campaignStats.reduce((sum, stat) => sum + stat.collectedAmount, 0)
    const availableBalance = campaignStats.reduce((sum, stat) => sum + stat.balance, 0)
    const totalDonors = new Set(
      campaignStats.flatMap((_, index) => 
        Array(campaignStats[index].donorCount).fill(index)
      )
    ).size // Approximate unique donors
    const totalDonations = campaignStats.reduce((sum, stat) => sum + stat.donationCount, 0)
    const totalWithdrawn = totalRaised - availableBalance

    return {
      totalCampaigns: deployedCampaigns.length,
      totalRaised,
      totalDonors,
      totalDonations,
      availableBalance,
      totalWithdrawn,
    }
  } catch (error) {
    console.error('Error fetching organization blockchain stats:', error)
    return {
      totalCampaigns: 0,
      totalRaised: 0,
      totalDonors: 0,
      totalDonations: 0,
      availableBalance: 0,
      totalWithdrawn: 0,
    }
  }
}

/**
 * Get campaign blockchain data with error handling
 */
export async function getCampaignBlockchainData(contractAddress: string) {
  try {
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

    const targetAmountEth = Number(weiToEth(targetAmount))
    const collectedAmountEth = Number(weiToEth(collectedAmount))
    const balanceEth = Number(weiToEth(balance))

    const progress = targetAmountEth > 0 
      ? Math.min(100, Math.round((collectedAmountEth / targetAmountEth) * 100))
      : 0

    const deadlineTimestamp = Number(deadline)
    const now = Math.floor(Date.now() / 1000)
    const daysRemaining = Math.max(0, Math.floor((deadlineTimestamp - now) / 86400))

    return {
      organization,
      targetAmount: targetAmountEth,
      collectedAmount: collectedAmountEth,
      balance: balanceEth,
      deadline: deadlineTimestamp,
      isActive,
      isFrozen,
      donationCount: Number(donationCount),
      donorCount: Number(donorCount),
      progress,
      daysRemaining,
    }
  } catch (error) {
    console.error(`Error fetching blockchain data for ${contractAddress}:`, error)
    return null
  }
}

/**
 * Format ETH amount to IDR (approximate)
 * Using approximate rate: 1 ETH = 50,000,000 IDR
 */
export function ethToIdr(ethAmount: number): string {
  const ETH_TO_IDR_RATE = 50000000 // Approximate rate
  const idrAmount = ethAmount * ETH_TO_IDR_RATE
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(idrAmount)
}

/**
 * Format ETH amount
 */
export function formatEth(ethAmount: number): string {
  return `${ethAmount.toFixed(4)} ETH`
}
