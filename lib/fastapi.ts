/**
 * FastAPI Integration Layer
 * Handles communication with Python FastAPI backend
 */

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

export interface OrganizationDetailResponse {
  id: string
  name: string
  description: string | null
  phone: string | null
  address: string | null
  website: string | null
  image_url: string | null
  ktp_url: string | null
  legal_doc_url: string | null
  is_verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  profile: {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    wallet_address: string | null
    role: string
    bio: string | null
    phone: string | null
  }
  campaigns: Array<{
    id: string
    title: string
    description: string
    category: string
    image_url: string | null
    target_amount: number
    contract_address: string
    status: string
    start_date: string
    end_date: string
    created_at: string
    updated_at: string
  }>
}

/**
 * Fetch organization detail with profile and campaigns from FastAPI
 * @param orgId - Organization UUID
 * @returns Organization detail with profile and campaigns
 * @throws Error if request fails
 */
export async function getOrganizationDetail(
  orgId: string
): Promise<OrganizationDetailResponse> {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/organizations/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Organisasi tidak ditemukan')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      // Network error or fetch failed
      if (error.message.includes('fetch')) {
        throw new Error(
          'Tidak dapat terhubung ke server FastAPI. Pastikan server berjalan di ' +
            FASTAPI_URL
        )
      }
      throw error
    }
    throw new Error('Gagal mengambil data organisasi')
  }
}

/**
 * Check FastAPI health status
 * @returns Health status
 */
export async function checkFastAPIHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${FASTAPI_URL}/health`)
    if (!response.ok) {
      throw new Error('Health check failed')
    }
    return await response.json()
  } catch (error) {
    throw new Error('FastAPI server tidak dapat diakses')
  }
}
