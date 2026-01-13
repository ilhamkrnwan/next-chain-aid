'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { freezeCampaign, unfreezeCampaign } from '@/lib/admin-blockchain-actions'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { createClient } from '@/lib/supabase/client'

interface CampaignActionsProps {
  campaign: {
    id: string
    contract_address: string | null
    is_frozen: boolean
    title: string
  }
  onSuccess?: () => void
}

export function CampaignActions({ campaign, onSuccess }: CampaignActionsProps) {
  const { address, isConnected } = useAccount()
  const [freezeReason, setFreezeReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  if (!campaign.contract_address) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        No Contract
      </Button>
    )
  }

  const handleFreeze = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!campaign.contract_address) {
      toast.error('Campaign has no contract address')
      return
    }

    if (!freezeReason.trim()) {
      toast.error('Please provide a reason for freezing')
      return
    }

    setLoading(true)
    try {
      // Get admin profile
      const supabase = createClient()
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (profileError || !profile) {
        throw new Error('Admin profile not found. Please ensure your wallet is registered as admin.')
      }

      if (profile.role !== 'admin') {
        throw new Error('Only admins can freeze campaigns')
      }

      // Freeze campaign (contract_address is guaranteed non-null here)
      const result = await freezeCampaign(
        campaign.contract_address,
        campaign.id,
        freezeReason,
        profile.id
      )

      toast.success(
        <div>
          <p className="font-semibold">Campaign frozen successfully!</p>
          <p className="text-xs text-muted-foreground mt-1">
            TX: {result.txHash.slice(0, 10)}...
          </p>
        </div>
      )
      
      setFreezeReason('')
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Freeze error:', error)
      toast.error(error.message || 'Failed to freeze campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfreeze = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!campaign.contract_address) {
      toast.error('Campaign has no contract address')
      return
    }

    setLoading(true)
    try {
      // Get admin profile
      const supabase = createClient()
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (profileError || !profile) {
        throw new Error('Admin profile not found. Please ensure your wallet is registered as admin.')
      }

      if (profile.role !== 'admin') {
        throw new Error('Only admins can unfreeze campaigns')
      }

      // Unfreeze campaign (contract_address is guaranteed non-null here)
      const result = await unfreezeCampaign(
        campaign.contract_address,
        campaign.id,
        profile.id
      )

      toast.success(
        <div>
          <p className="font-semibold">Campaign unfrozen successfully!</p>
          <p className="text-xs text-muted-foreground mt-1">
            TX: {result.txHash.slice(0, 10)}...
          </p>
        </div>
      )
      
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Unfreeze error:', error)
      toast.error(error.message || 'Failed to unfreeze campaign')
    } finally {
      setLoading(false)
    }
  }

  if (campaign.is_frozen) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            🔓 Unfreeze
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfreeze Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unfreeze <strong>"{campaign.title}"</strong>? 
              This will allow donations and withdrawals again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfreeze} disabled={loading}>
              {loading ? 'Processing...' : 'Unfreeze Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          🔒 Freeze
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Freeze Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent all donations and withdrawals for <strong>"{campaign.title}"</strong>. 
            Please provide a reason for this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Reason for freezing (e.g., suspicious activity, fraud investigation, policy violation)"
            value={freezeReason}
            onChange={(e) => setFreezeReason(e.target.value)}
            className="min-h-24"
            disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFreeze}
            disabled={loading || !freezeReason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Processing...' : 'Freeze Campaign'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
