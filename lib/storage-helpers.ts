import { createClient } from '@/lib/supabase/client'

/**
 * Storage helper for multiple image uploads
 */

export interface UploadedImage {
  url: string
  path: string
  name: string
}

/**
 * Generate unique filename for uploaded image
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * Upload single image to Supabase Storage
 */
export async function uploadImage(
  bucket: string,
  folder: string,
  file: File
): Promise<UploadedImage> {
  const supabase = createClient()
  
  const filename = generateUniqueFilename(file.name)
  const path = `${folder}/${filename}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
    name: filename,
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
export async function uploadMultipleImages(
  bucket: string,
  folder: string,
  files: File[]
): Promise<UploadedImage[]> {
  const uploadPromises = files.map(file => uploadImage(bucket, folder, file))
  return Promise.all(uploadPromises)
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Delete multiple images from Supabase Storage
 */
export async function deleteMultipleImages(
  bucket: string,
  paths: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`)
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(bucket: string, path: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload JPG, PNG, or WebP images.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.',
    }
  }

  return { valid: true }
}

/**
 * Validate multiple image files
 */
export function validateMultipleImages(
  files: File[],
  maxFiles: number = 5
): { valid: boolean; error?: string } {
  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} images allowed.`,
    }
  }

  for (const file of files) {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return validation
    }
  }

  return { valid: true }
}

/**
 * Create image preview URL from File
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke image preview URL
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}
