import {
  getAllBlockchainCampaigns,
  getCampaignSummary,
  getCampaignDonations,
  getCampaignWithdrawals,
  weiToEth,
  getProvider,
} from '@/lib/blockchain'
import type { BlockchainTransaction } from '@/lib/types'

// ============================================================================
// ADMIN BLOCKCHAIN MONITORING
// ============================================================================

/**
 * Get all campaigns with blockchain data
 */
export async function getAllCampaignsWithBlockchainData() {
  try {
    const contractAddresses = await getAllBlockchainCampaigns()
    
    const campaignsData = await Promise.all(
      contractAddresses.map(async (address) => {
        try {
          const summary = await getCampaignSummary(address)
          const donations = await getCampaignDonations(address)
          const withdrawals = await getCampaignWithdrawals(address)
          
          return {
            contractAddress: address,
            summary,
            donations,
            withdrawals,
            totalDonations: donations.length,
            totalWithdrawals: withdrawals.length,
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${address}:`, error)
          return null
        }
      })
    )
    
    return campaignsData.filter(Boolean)
  } catch (error) {
    console.error('Failed to fetch blockchain campaigns:', error)
    return []
  }
}

/**
 * Get blockchain statistics for admin dashboard
 */
export async function getBlockchainStats() {
  try {
    const campaigns = await getAllCampaignsWithBlockchainData()
    
    let totalDonations = 0
    let totalAmount = BigInt(0)
    let totalWithdrawals = 0
    let totalWithdrawnAmount = BigInt(0)
    const uniqueDonors = new Set<string>()
    
    campaigns.forEach((campaign) => {
      if (campaign) {
        totalDonations += campaign.totalDonations
        totalAmount += campaign.summary.collectedAmount
        totalWithdrawals += campaign.totalWithdrawals
        
        // Track unique donors
        campaign.donations.forEach((d) => uniqueDonors.add(d.donor.toLowerCase()))
        
        // Sum withdrawn amounts
        campaign.withdrawals.forEach((w) => {
          totalWithdrawnAmount += w.amount
        })
      }
    })
    
    return {
      totalCampaigns: campaigns.length,
      totalDonations,
      totalAmount: weiToEth(totalAmount),
      totalWithdrawals,
      totalWithdrawnAmount: weiToEth(totalWithdrawnAmount),
      totalDonors: uniqueDonors.size,
      campaigns,
    }
  } catch (error) {
    console.error('Failed to get blockchain stats:', error)
    return {
      totalCampaigns: 0,
      totalDonations: 0,
      totalAmount: '0',
      totalWithdrawals: 0,
      totalWithdrawnAmount: '0',
      totalDonors: 0,
      campaigns: [],
    }
  }
}

/**
 * Get all transactions from blockchain (donations + withdrawals)
 */
export async function getAllTransactionsFromBlockchain(): Promise<BlockchainTransaction[]> {
  try {
    const campaigns = await getAllCampaignsWithBlockchainData()
    
    const allTransactions: BlockchainTransaction[] = []
    
    campaigns.forEach((campaign) => {
      if (!campaign) return
      
      // Add donations
      campaign.donations.forEach((donation) => {
        allTransactions.push({
          type: 'donation',
          contractAddress: campaign.contractAddress,
          from: donation.donor,
          amount: weiToEth(donation.amount),
          message: donation.message,
          timestamp: donation.timestamp,
        })
      })
      
      // Add withdrawals
      campaign.withdrawals.forEach((withdrawal) => {
        allTransactions.push({
          type: 'withdrawal',
          contractAddress: campaign.contractAddress,
          to: withdrawal.recipient,
          amount: weiToEth(withdrawal.amount),
          description: withdrawal.description,
          timestamp: withdrawal.timestamp,
        })
      })
    })
    
    // Sort by timestamp descending (newest first)
    allTransactions.sort((a, b) => b.timestamp - a.timestamp)
    
    return allTransactions
  } catch (error) {
    console.error('Failed to get all transactions:', error)
    return []
  }
}

/**
 * Get campaign blockchain status
 */
export async function getCampaignBlockchainStatus(contractAddress: string) {
  try {
    const summary = await getCampaignSummary(contractAddress)
    const donations = await getCampaignDonations(contractAddress)
    const withdrawals = await getCampaignWithdrawals(contractAddress)
    
    return {
      summary,
      donations,
      withdrawals,
      totalDonations: donations.length,
      totalWithdrawals: withdrawals.length,
      collectedAmount: weiToEth(summary.collectedAmount),
      balance: weiToEth(summary.balance),
      isActive: summary.isActive,
      isFrozen: summary.isFrozen,
    }
  } catch (error) {
    console.error(`Failed to get blockchain status for ${contractAddress}:`, error)
    return null
  }
}

/**
 * Check blockchain network status
 */
export async function getNetworkStatus() {
  try {
    const provider = getProvider()
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()
    
    return {
      isConnected: true,
      chainId: Number(network.chainId),
      networkName: network.name,
      blockNumber,
    }
  } catch (error) {
    console.error('Failed to get network status:', error)
    return {
      isConnected: false,
      chainId: 0,
      networkName: 'Unknown',
      blockNumber: 0,
    }
  }
}
