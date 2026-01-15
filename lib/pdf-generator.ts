/**
 * PDF Generator Utility - Professional Clean Modern Design
 * Generates professional PDF reports with ChainAid branding and clean soft design
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OrganizationDetailResponse } from './fastapi'

// ChainAid Company Information
const COMPANY_INFO = {
  name: 'PT ChainAid Teknologi Sosial',
  business: 'Teknologi Informasi – SaaS & Blockchain',
  product: 'Platform Manajemen Campaign & Donasi',
  status: 'Startup Teknologi',
  address: 'Jl. Teknologi Digital No. 88, Jakarta Selatan, DKI Jakarta 12950',
  email: 'support@chainaid.id',
  phone: '+62 812-3456-7890',
  website: 'https://chainaid.id',
}

// Soft Modern Color Scheme - Cleaner & Softer
const COLORS = {
  primary: [52, 152, 219] as [number, number, number], // Soft Blue
  primaryDark: [41, 128, 185] as [number, number, number], // Darker Blue
  accent: [46, 204, 113] as [number, number, number], // Soft Green
  accentLight: [125, 206, 160] as [number, number, number], // Light Green
  dark: [44, 62, 80] as [number, number, number], // Dark Blue Gray
  light: [245, 247, 250] as [number, number, number], // Very Light Gray
  lightBorder: [236, 240, 241] as [number, number, number], // Light Border
  white: [255, 255, 255] as [number, number, number],
  text: [52, 73, 94] as [number, number, number], // Dark Gray
  textLight: [127, 140, 141] as [number, number, number], // Light Gray Text
  border: [189, 195, 199] as [number, number, number], // Gray
}

/**
 * Safe text helper - prevents encoding issues and handles null values
 */
function safeText(text: string | null | undefined): string {
  if (!text || text.trim() === '') return '-'
  // Simple ASCII normalization to prevent PDF encoding issues
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .trim() || '-'
}

/**
 * Format currency to IDR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
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
 * Format status to Indonesian
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    active: 'Aktif',
    ended: 'Berakhir',
    draft: 'Draft',
    pending_approval: 'Menunggu Persetujuan',
    frozen: 'Dibekukan',
  }
  return statusMap[status] || status
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
  return categoryMap[category] || category
}

/**
 * Load image from URL and convert to base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
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
 * Load ChainAid logo
 */
async function loadChainAidLogo(): Promise<string | null> {
  try {
    // Try to load from public folder
    const logoUrl = '/logo.png'
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      return await loadImageAsBase64(window.location.origin + logoUrl)
    }
    return null
  } catch (error) {
    console.error('Error loading ChainAid logo:', error)
    return null
  }
}

/**
 * Add modern clean header with logo
 */
async function addModernHeader(doc: jsPDF, pageWidth: number, logoData: string | null): Promise<number> {
  let yPosition = 15

  // Soft gradient header background
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Lighter gradient overlay for depth
  doc.setFillColor(255, 255, 255, 0.1)
  doc.rect(0, 0, pageWidth, 25, 'F')

  // Add logo if available
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 15, 12, 25, 25)
    } catch (error) {
      console.error('Error adding logo to header:', error)
    }
  }

  // Company Name & Tagline
  const textStartX = logoData ? 45 : 15
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ChainAid', textStartX, 23)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255, 0.9)
  doc.text('Platform Donasi Transparan Berbasis Blockchain', textStartX, 31)

  // Document Title - Right side
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN ORGANISASI', pageWidth - 15, 23, { align: 'right' })

  // Date - Right side
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255, 0.85)
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(currentDate, pageWidth - 15, 31, { align: 'right' })

  // Soft accent line
  doc.setDrawColor(...COLORS.accentLight)
  doc.setLineWidth(1.5)
  doc.line(0, 50, pageWidth, 50)

  return 60 // Return starting Y position for content
}

/**
 * Add clean company footer with logo
 */
function addCompanyFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNum: number,
  totalPages: number,
  logoData: string | null
): void {
  // Soft footer background
  doc.setFillColor(...COLORS.light)
  doc.rect(0, pageHeight - 40, pageWidth, 40, 'F')

  // Top border line
  doc.setDrawColor(...COLORS.lightBorder)
  doc.setLineWidth(0.5)
  doc.line(0, pageHeight - 40, pageWidth, pageHeight - 40)

  // Add small logo in footer
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 15, pageHeight - 35, 15, 15)
    } catch (error) {
      console.error('Error adding logo to footer:', error)
    }
  }

  // Company info - Left side
  const textStartX = logoData ? 35 : 15
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_INFO.name, textStartX, pageHeight - 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.textLight)
  doc.text(COMPANY_INFO.address, textStartX, pageHeight - 25)
  doc.text(
    `Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phone}`,
    textStartX,
    pageHeight - 21
  )
  doc.text(`Website: ${COMPANY_INFO.website}`, textStartX, pageHeight - 17)

  // Page number - Right side
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.text)
  doc.text(
    `Halaman ${pageNum} dari ${totalPages}`,
    pageWidth - 15,
    pageHeight - 25,
    { align: 'right' }
  )

  // Generation timestamp
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.textLight)
  doc.text(
    `Digenerate: ${new Date().toLocaleString('id-ID')} WIB`,
    pageWidth - 15,
    pageHeight - 19,
    { align: 'right' }
  )
}

/**
 * Add soft section header
 */
function addSectionHeader(
  doc: jsPDF,
  title: string,
  yPosition: number,
  pageWidth: number
): number {
  // Soft background with rounded corners
  doc.setFillColor(...COLORS.primary)
  doc.setDrawColor(...COLORS.primary)
  doc.roundedRect(15, yPosition - 6, pageWidth - 30, 12, 3, 3, 'FD')

  // Title
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, yPosition + 2)

  return yPosition + 14
}

/**
 * Generate PDF report for organization with clean modern design
 */
export async function generateOrganizationPDF(
  data: OrganizationDetailResponse
): Promise<jsPDF> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Load ChainAid logo
  const logoData = await loadChainAidLogo()

  // Add modern header with logo
  let yPosition = await addModernHeader(doc, pageWidth, logoData)

  // ============================================================================
  // Organization Information Section
  // ============================================================================

  yPosition = addSectionHeader(doc, '📋 Informasi Organisasi', yPosition, pageWidth)
  yPosition += 8

  // Try to load organization image
  let orgImageData: string | null = null
  if (data.image_url) {
    orgImageData = await loadImageAsBase64(data.image_url)
  }

  // Organization image (if available)
  if (orgImageData) {
    try {
      // Soft border around image
      doc.setDrawColor(...COLORS.lightBorder)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, yPosition, 42, 42, 2, 2, 'S')
      doc.addImage(orgImageData, 'JPEG', 16, yPosition + 1, 40, 40)

      // Organization info next to image
      const infoStartX = 62
      doc.setTextColor(...COLORS.text)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(safeText(data.name), infoStartX, yPosition + 8)

      // Status badge with softer colors
      const statusColor: [number, number, number] =
        data.status === 'approved'
          ? COLORS.accent
          : data.status === 'pending'
          ? ([243, 156, 18] as [number, number, number])
          : ([231, 76, 60] as [number, number, number])

      doc.setFillColor(...statusColor)
      doc.roundedRect(infoStartX, yPosition + 14, 35, 7, 2, 2, 'F')
      doc.setTextColor(...COLORS.white)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(formatStatus(data.status), infoStartX + 17.5, yPosition + 18.5, {
        align: 'center',
      })

      // Verified badge
      if (data.is_verified) {
        doc.setFillColor(...COLORS.accentLight)
        doc.roundedRect(infoStartX + 38, yPosition + 14, 30, 7, 2, 2, 'F')
        doc.setTextColor(...COLORS.white)
        doc.setFontSize(8)
        doc.text('✓ Terverifikasi', infoStartX + 53, yPosition + 18.5, {
          align: 'center',
        })
      }

      yPosition += 50
    } catch (error) {
      console.error('Error adding organization image:', error)
      // Fallback to text-only
      doc.setTextColor(...COLORS.text)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(safeText(data.name), 15, yPosition)
      yPosition += 12
    }
  } else {
    // No image - just show name
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(safeText(data.name), 15, yPosition)
    yPosition += 12
  }

  // Organization details table with cleaner design
  const orgInfo = [
    ['Deskripsi', safeText(data.description)],
    ['Alamat', safeText(data.address)],
    ['Telepon', safeText(data.phone)],
    ['Website', safeText(data.website)],
    ['Terdaftar Sejak', formatDate(data.created_at)],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: orgInfo,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: COLORS.text,
      lineColor: COLORS.lightBorder,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: COLORS.dark,
      },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (cellData) => {
      // Soft alternating rows
      if (cellData.row.index % 2 === 0) {
        doc.setFillColor(...COLORS.light)
        doc.rect(
          cellData.cell.x,
          cellData.cell.y,
          cellData.cell.width,
          cellData.cell.height,
          'F'
        )
      }
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // ============================================================================
  // Owner Information Section
  // ============================================================================

  if (yPosition > pageHeight - 90) {
    doc.addPage()
    yPosition = await addModernHeader(doc, pageWidth, logoData)
  }

  yPosition = addSectionHeader(doc, '👤 Informasi Pemilik', yPosition, pageWidth)
  yPosition += 8

  const ownerInfo = [
    ['Nama Lengkap', safeText(data.profile.full_name)],
    ['Email', safeText(data.profile.email)],
    ['Role', safeText(data.profile.role?.toUpperCase())],
    ['Telepon', safeText(data.profile.phone)],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: ownerInfo,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: COLORS.text,
      lineColor: COLORS.lightBorder,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: COLORS.dark,
      },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (cellData) => {
      if (cellData.row.index % 2 === 0) {
        doc.setFillColor(...COLORS.light)
        doc.rect(
          cellData.cell.x,
          cellData.cell.y,
          cellData.cell.width,
          cellData.cell.height,
          'F'
        )
      }
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // ============================================================================
  // Campaigns Section
  // ============================================================================

  if (yPosition > pageHeight - 90) {
    doc.addPage()
    yPosition = await addModernHeader(doc, pageWidth, logoData)
  }

  yPosition = addSectionHeader(
    doc,
    `🎯 Daftar Campaign (${data.campaigns.length})`,
    yPosition,
    pageWidth
  )
  yPosition += 8

  if (data.campaigns.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...COLORS.textLight)
    doc.text('Belum ada campaign yang dibuat', 15, yPosition)
    yPosition += 10
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
      head: [
        ['No', 'Judul Campaign', 'Kategori', 'Target Dana', 'Status', 'Mulai', 'Berakhir'],
      ],
      body: campaignRows,
      theme: 'striped',
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
        lineColor: COLORS.lightBorder,
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: COLORS.light,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center', fontSize: 7 },
        6: { cellWidth: 25, halign: 'center', fontSize: 7 },
      },
      margin: { left: 15, right: 15 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // ============================================================================
  // Add Footer to All Pages
  // ============================================================================

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addCompanyFooter(doc, pageWidth, pageHeight, i, totalPages, logoData)
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
  const filename = `Organisasi_${safeName}_${timestamp}.pdf`
  downloadPDF(doc, filename)
}
