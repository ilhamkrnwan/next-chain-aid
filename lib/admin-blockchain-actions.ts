import { getCampaignContract, getSigner } from '@/lib/blockchain'
import { createClient } from '@/lib/supabase/client'

/**
 * Freeze a campaign (admin only)
 */
export async function freezeCampaign(
  contractAddress: string,
  campaignId: string,
  reason: string,
  adminId: string
) {
  try {
    console.log('🔒 Starting freeze campaign process...')
    console.log('Contract:', contractAddress)
    console.log('Campaign ID:', campaignId)
    console.log('Reason:', reason)
    
    // 1. Call smart contract
    const signer = await getSigner()
    const signerAddress = await signer.getAddress()
    console.log('Admin wallet:', signerAddress)
    
    const contract = getCampaignContract(contractAddress, signer)
    
    console.log('📝 Calling freezeCampaign() on smart contract...')
    const tx = await contract.freezeCampaign()
    console.log('⏳ Transaction sent:', tx.hash)
    console.log('⏳ Waiting for confirmation...')
    
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)
    
    // 2. Update database
    const supabase = createClient()
    console.log('💾 Updating database...')
    
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        is_frozen: true,
        frozen_at: new Date().toISOString(),
        frozen_by: adminId,
        freeze_reason: reason
      })
      .eq('id', campaignId)
    
    if (updateError) {
      console.error('❌ Database update error:', updateError)
      throw updateError
    }
    console.log('✅ Database updated')
    
    // 3. Log admin action
    console.log('📋 Logging admin action...')
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'freeze_campaign',
        target_type: 'campaign',
        target_id: campaignId,
        details: {
          contract_address: contractAddress,
          reason,
          tx_hash: tx.hash,
          block_number: receipt.blockNumber
        }
      })
    
    if (logError) {
      console.error('❌ Logging error:', logError)
      throw logError
    }
    console.log('✅ Action logged')
    
    return { 
      success: true, 
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    }
  } catch (error: any) {
    console.error('❌ Error freezing campaign:', error)
    
    // User-friendly error messages
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user')
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for gas fee')
    }
    
    throw new Error(error.message || 'Failed to freeze campaign')
  }
}

/**
 * Unfreeze a campaign (admin only)
 */
export async function unfreezeCampaign(
  contractAddress: string,
  campaignId: string,
  adminId: string
) {
  try {
    console.log('🔓 Starting unfreeze campaign process...')
    console.log('Contract:', contractAddress)
    console.log('Campaign ID:', campaignId)
    
    // 1. Call smart contract
    const signer = await getSigner()
    const signerAddress = await signer.getAddress()
    console.log('Admin wallet:', signerAddress)
    
    const contract = getCampaignContract(contractAddress, signer)
    
    console.log('📝 Calling unfreezeCampaign() on smart contract...')
    const tx = await contract.unfreezeCampaign()
    console.log('⏳ Transaction sent:', tx.hash)
    console.log('⏳ Waiting for confirmation...')
    
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)
    
    // 2. Update database
    const supabase = createClient()
    console.log('💾 Updating database...')
    
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        is_frozen: false,
        frozen_at: null,
        frozen_by: null,
        freeze_reason: null
      })
      .eq('id', campaignId)
    
    if (updateError) {
      console.error('❌ Database update error:', updateError)
      throw updateError
    }
    console.log('✅ Database updated')
    
    // 3. Log admin action
    console.log('📋 Logging admin action...')
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'unfreeze_campaign',
        target_type: 'campaign',
        target_id: campaignId,
        details: {
          contract_address: contractAddress,
          tx_hash: tx.hash,
          block_number: receipt.blockNumber
        }
      })
    
    if (logError) {
      console.error('❌ Logging error:', logError)
      throw logError
    }
    console.log('✅ Action logged')
    
    return { 
      success: true, 
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    }
  } catch (error: any) {
    console.error('❌ Error unfreezing campaign:', error)
    
    // User-friendly error messages
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user')
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for gas fee')
    }
    
    throw new Error(error.message || 'Failed to unfreeze campaign')
  }
}
