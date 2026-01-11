import { ethers } from 'ethers'

/**
 * Simple cache for blockchain data
 */
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

/**
 * Get cached data or fetch new
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cacheDuration: number = CACHE_DURATION
): Promise<T> {
  const cached = cache.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < cacheDuration) {
    return cached.data as T
  }

  const data = await fetchFn()
  cache.set(key, { data, timestamp: now })
  return data
}

/**
 * Clear cache for specific key or all
 */
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on user rejection
      if (error.code === 'ACTION_REJECTED') {
        throw error
      }

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries reached')
}

/**
 * Batch multiple RPC calls
 */
export async function batchRpcCalls<T>(
  calls: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = []
  
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(call => call()))
    results.push(...batchResults)
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < calls.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}
