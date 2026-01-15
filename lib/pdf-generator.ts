/**
 * PDF Generator Utility - Modern Professional Design
 * Generates beautiful, professional PDF reports with ChainAid branding
 * 
 * Features:
 * - Clean modern layout with soft color palette
 * - Professional typography and spacing
 * - Responsive design elements
 * - Image support with fallbacks
 * - Comprehensive error handling
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OrganizationDetailResponse } from './fastapi'

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COMPANY_INFO = {
  name: 'PT ChainAid Teknologi Sosial',
  business: 'Teknologi Informasi – SaaS & Blockchain',
  product: 'Platform Manajemen Campaign & Donasi',
  status: 'Startup Teknologi',
  address: 'Jl. Teknologi Digital No. 88, Jakarta Selatan, DKI Jakarta 12950',
  email: 'support@chainaid.id',
  phone: '+62 812-3456-7890',
  website: 'https://chainaid.id',
} as const

// Modern Color Palette - Professional & Clean
const COLORS = {
  // Primary Colors
  primary: [41, 128, 185] as [number, number, number],      // Professional Blue
  primaryLight: [52, 152, 219] as [number, number, number], // Light Blue
  primaryDark: [21, 67, 96] as [number, number, number],    // Dark Blue
  
  // Accent Colors
  accent: [39, 174, 96] as [number, number, number],        // Success Green
  accentLight: [125, 206, 160] as [number, number, number], // Light Green
  warning: [243, 156, 18] as [number, number, number],      // Warning Orange
  danger: [231, 76, 60] as [number, number, number],        // Danger Red
  
  // Neutrals
  dark: [44, 62, 80] as [number, number, number],           // Dark Text
  text: [52, 73, 94] as [number, number, number],           // Body Text
  textLight: [127, 140, 141] as [number, number, number],   // Secondary Text
  
  // Backgrounds
  white: [255, 255, 255] as [number, number, number],
  light: [248, 249, 250] as [number, number, number],       // Light Background
  lightGray: [236, 240, 241] as [number, number, number],   // Border Gray
  border: [189, 195, 199] as [number, number, number],      // Border Color
} as const

const LAYOUT = {
  margin: 15,
  headerHeight: 70,
  footerHeight: 45,
  sectionSpacing: 15,
  contentPadding: 8,
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely process text to prevent encoding issues
 */
function safeText(text: string | null | undefined): string {
  if (!text || text.trim() === '') return '-'
  
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x00-\x7F]/g, '')     // Remove non-ASCII
    .trim() || '-'
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

/**
 * Format status with proper Indonesian labels
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    active: 'Aktif',
    ended: 'Berakhir',
    draft: 'Draft',
    pending_approval: 'Menunggu Persetujuan',
    frozen: 'Dibekukan',
  }
  return statusMap[status.toLowerCase()] || status
}

/**
 * Format category to Indonesian
 */
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    kesehatan: 'Kesehatan',
    pendidikan: 'Pendidikan',
    bencana_alam: 'Bencana Alam',
    lingkungan: 'Lingkungan',
    sosial: 'Sosial',
    ekonomi: 'Ekonomi',
    lainnya: 'Lainnya',
  }
  return categoryMap[category.toLowerCase()] || category
}

/**
 * Get status color based on status type
 */
function getStatusColor(status: string): [number, number, number] {
  const statusLower = status.toLowerCase()
  
  if (['approved', 'active'].includes(statusLower)) return COLORS.accent
  if (['pending', 'draft', 'pending_approval'].includes(statusLower)) return COLORS.warning
  if (['rejected', 'frozen'].includes(statusLower)) return COLORS.danger
  
  return COLORS.text
}

// ============================================================================
// IMAGE HANDLING
// ============================================================================

/**
 * Load image from URL and convert to base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

/**
 * Load ChainAid logo from public folder
 */
async function loadChainAidLogo(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null
    
    const logoUrl = '/logo.png'
    return await loadImageAsBase64(window.location.origin + logoUrl)
  } catch (error) {
    console.error('Error loading ChainAid logo:', error)
    return null
  }
}

// ============================================================================
// HEADER & FOOTER COMPONENTS
// ============================================================================

/**
 * Add modern professional header
 */
async function addModernHeader(
  doc: jsPDF,
  pageWidth: number,
  logoData: string | null
): Promise<number> {
  const { margin, headerHeight } = LAYOUT

  // Gradient-like header background
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')

  // Accent bar at bottom of header
  doc.setFillColor(...COLORS.accent)
  doc.rect(0, headerHeight - 3, pageWidth, 3, 'F')

  // Add logo
  const logoSize = 35
  const logoY = 15
  
  if (logoData) {
    try {
      // White background circle for logo
      doc.setFillColor(...COLORS.white)
      doc.circle(margin + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 'F')
      
      doc.addImage(logoData, 'PNG', margin, logoY, logoSize, logoSize)
    } catch (error) {
      console.error('Error adding logo to header:', error)
    }
  }

  // Company information
  const textStartX = logoData ? margin + logoSize + 12 : margin
  
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ChainAid', textStartX, 25)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Platform Donasi Transparan Berbasis Blockchain', textStartX, 33)

  doc.setFontSize(7.5)
  doc.text(COMPANY_INFO.name, textStartX, 41)
  
  doc.setFontSize(7)
  const contactInfo = `${COMPANY_INFO.email} • ${COMPANY_INFO.phone}`
  doc.text(contactInfo, textStartX, 48)

  // Document title and date - Right aligned
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN ORGANISASI', pageWidth - margin, 24, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(currentDate, pageWidth - margin, 33, { align: 'right' })

  doc.setFontSize(7.5)
  doc.text('Dokumen Resmi & Rahasia', pageWidth - margin, 42, { align: 'right' })

  return headerHeight + 10
}

/**
 * Add professional footer
 */
function addModernFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNum: number,
  totalPages: number,
  logoData: string | null
): void {
  const { margin, footerHeight } = LAYOUT
  const footerY = pageHeight - footerHeight

  // Footer background
  doc.setFillColor(...COLORS.light)
  doc.rect(0, footerY, pageWidth, footerHeight, 'F')

  // Top border
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(1)
  doc.line(0, footerY, pageWidth, footerY)

  // Small logo in footer
  const logoSize = 18
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin, footerY + 8, logoSize, logoSize)
    } catch (error) {
      console.error('Error adding logo to footer:', error)
    }
  }

  // Company details
  const textStartX = logoData ? margin + logoSize + 8 : margin
  
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_INFO.name, textStartX, footerY + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textLight)
  doc.text(COMPANY_INFO.address, textStartX, footerY + 17)
  doc.text(
    `${COMPANY_INFO.email} • ${COMPANY_INFO.phone} • ${COMPANY_INFO.website}`,
    textStartX,
    footerY + 22
  )

  // Page number - Right side
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.text)
  doc.text(
    `Hal. ${pageNum} / ${totalPages}`,
    pageWidth - margin,
    footerY + 15,
    { align: 'right' }
  )

  // Timestamp
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textLight)
  const timestamp = new Date().toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
  doc.text(
    `Dibuat: ${timestamp} WIB`,
    pageWidth - margin,
    footerY + 22,
    { align: 'right' }
  )

  // Confidentiality notice
  doc.setTextColor(...COLORS.textLight)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  const notice = 'Dokumen ini bersifat rahasia dan hanya untuk keperluan internal'
  const noticeWidth = doc.getTextWidth(notice)
  doc.text(notice, (pageWidth - noticeWidth) / 2, footerY + 35)
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

/**
 * Add elegant section header
 */
function addSectionHeader(
  doc: jsPDF,
  title: string,
  yPosition: number,
  pageWidth: number,
  icon?: string
): number {
  const { margin } = LAYOUT

  // Section header background
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 14, 2, 2, 'F')

  // Accent line on left
  doc.setFillColor(...COLORS.accent)
  doc.rect(margin, yPosition - 2, 4, 14, 'F')

  // Title
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const textX = icon ? margin + 10 : margin + 8
  doc.text((icon ? `${icon} ` : '') + title, textX, yPosition + 7)

  return yPosition + 18
}

/**
 * Add info card with key-value pairs
 */
function addInfoCard(
  doc: jsPDF,
  data: Array<[string, string]>,
  yPosition: number,
  pageWidth: number
): number {
  const { margin } = LAYOUT

  autoTable(doc, {
    startY: yPosition,
    body: data,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: COLORS.text,
      lineColor: COLORS.lightGray,
      lineWidth: 0.3,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 55,
        textColor: COLORS.dark,
        fillColor: COLORS.light,
      },
      1: {
        cellWidth: 'auto',
      },
    },
    margin: { left: margin, right: margin },
    didDrawCell: (data) => {
      // Add subtle border to cells
      if (data.section === 'body') {
        doc.setDrawColor(...COLORS.lightGray)
        doc.setLineWidth(0.2)
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height)
      }
    },
  })

  return (doc as any).lastAutoTable.finalY + LAYOUT.sectionSpacing
}

/**
 * Add organization image with styling
 */
async function addOrganizationImage(
  doc: jsPDF,
  imageUrl: string | null,
  name: string,
  status: string,
  isVerified: boolean,
  yPosition: number
): Promise<number> {
  const { margin } = LAYOUT
  const imageSize = 50

  let orgImageData: string | null = null
  if (imageUrl) {
    orgImageData = await loadImageAsBase64(imageUrl)
  }

  if (orgImageData) {
    try {
      // Image container with shadow effect
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(margin - 1, yPosition - 1, imageSize + 2, imageSize + 2, 3, 3, 'F')
      
      doc.setDrawColor(...COLORS.border)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, yPosition, imageSize, imageSize, 2, 2, 'S')
      
      doc.addImage(orgImageData, 'JPEG', margin + 1, yPosition + 1, imageSize - 2, imageSize - 2)

      // Organization name and badges
      const infoX = margin + imageSize + 12
      
      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(safeText(name), infoX, yPosition + 10)

      // Status badge
      const statusColor = getStatusColor(status)
      doc.setFillColor(...statusColor)
      doc.roundedRect(infoX, yPosition + 18, 38, 9, 2, 2, 'F')
      
      doc.setTextColor(...COLORS.white)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(formatStatus(status), infoX + 19, yPosition + 23.5, { align: 'center' })

      // Verified badge
      if (isVerified) {
        doc.setFillColor(...COLORS.accent)
        doc.roundedRect(infoX + 42, yPosition + 18, 35, 9, 2, 2, 'F')
        
        doc.setTextColor(...COLORS.white)
        doc.text('✓ Terverifikasi', infoX + 59.5, yPosition + 23.5, { align: 'center' })
      }

      return yPosition + imageSize + 12
    } catch (error) {
      console.error('Error adding organization image:', error)
    }
  }

  // Fallback without image
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(safeText(name), margin, yPosition + 5)

  return yPosition + 15
}

// ============================================================================
// MAIN PDF GENERATION
// ============================================================================

/**
 * Generate professional PDF report for organization
 */
export async function generateOrganizationPDF(
  data: OrganizationDetailResponse
): Promise<jsPDF> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Load logo
  const logoData = await loadChainAidLogo()

  // Add header
  let yPosition = await addModernHeader(doc, pageWidth, logoData)

  // ============================================================================
  // ORGANIZATION INFORMATION
  // ============================================================================

  yPosition = addSectionHeader(doc, 'Informasi Organisasi', yPosition, pageWidth)
  yPosition += 10

  // Add organization image and basic info
  yPosition = await addOrganizationImage(
    doc,
    data.image_url,
    data.name,
    data.status,
    data.is_verified,
    yPosition
  )

  // Organization details
  const orgInfo: Array<[string, string]> = [
    ['Deskripsi', safeText(data.description)],
    ['Alamat Lengkap', safeText(data.address)],
    ['Nomor Telepon', safeText(data.phone)],
    ['Website', safeText(data.website)],
    ['Tanggal Registrasi', formatDate(data.created_at)],
  ]

  yPosition = addInfoCard(doc, orgInfo, yPosition, pageWidth)

  // ============================================================================
  // OWNER INFORMATION
  // ============================================================================

  // Check if new page needed
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = await addModernHeader(doc, pageWidth, logoData)
  }

  yPosition = addSectionHeader(doc, 'Informasi Pemilik', yPosition, pageWidth)
  yPosition += 10

  const ownerInfo: Array<[string, string]> = [
    ['Nama Lengkap', safeText(data.profile.full_name)],
    ['Alamat Email', safeText(data.profile.email)],
    ['Peran', safeText(data.profile.role?.toUpperCase())],
    ['Nomor Telepon', safeText(data.profile.phone)],
  ]

  yPosition = addInfoCard(doc, ownerInfo, yPosition, pageWidth)

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  // Check if new page needed
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = await addModernHeader(doc, pageWidth, logoData)
  }

  yPosition = addSectionHeader(
    doc,
    `Daftar Campaign (${data.campaigns.length})`,
    yPosition,
    pageWidth,
  )
  yPosition += 10

  if (data.campaigns.length === 0) {
    doc.setFillColor(...COLORS.light)
    doc.roundedRect(LAYOUT.margin, yPosition, pageWidth - 2 * LAYOUT.margin, 20, 2, 2, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...COLORS.textLight)
    doc.text('Belum ada campaign yang dibuat', LAYOUT.margin + 10, yPosition + 12)
    
    yPosition += 25
  } else {
    const campaignRows = data.campaigns.map((campaign, index) => [
      (index + 1).toString(),
      safeText(campaign.title),
      formatCategory(campaign.category),
      formatCurrency(campaign.target_amount),
      formatStatus(campaign.status),
      formatDate(campaign.start_date),
      formatDate(campaign.end_date),
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['No', 'Judul Campaign', 'Kategori', 'Target Dana', 'Status']],
      body: campaignRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: 4,
      },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: COLORS.text,
        lineColor: COLORS.lightGray,
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: COLORS.light,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold', fillColor: COLORS.light },
        1: { cellWidth: 45 },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: COLORS.primary },
        4: { cellWidth: 28, halign: 'center' },
      },
      margin: { left: LAYOUT.margin, right: LAYOUT.margin },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // ============================================================================
  // ADD FOOTERS
  // ============================================================================

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addModernFooter(doc, pageWidth, pageHeight, i, totalPages, logoData)
  }

  return doc
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename)
}

/**
 * Generate and download organization PDF report
 */
export async function generateAndDownloadOrganizationPDF(
  data: OrganizationDetailResponse,
  organizationName?: string
): Promise<void> {
  const doc = await generateOrganizationPDF(data)
  
  const timestamp = new Date().toISOString().split('T')[0]
  const safeName = safeText(organizationName || data.name)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50)
  
  const filename = `Laporan_Organisasi_${safeName}_${timestamp}.pdf`
  downloadPDF(doc, filename)
}