export interface Transaction {
  id: string
  type: "donation" | "distribution"
  campaignTitle: string
  organizationName: string
  amount: number
  donorName?: string
  status: "pending" | "confirmed" | "failed"
  date: string
  txHash: string
  blockNumber: number
}

export const mockTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "donation",
    campaignTitle: "Gempa Bumi Lombok - Bantuan Darurat",
    organizationName: "Gerakan Disaster Relief",
    amount: 1500000,
    donorName: "Budi Santoso",
    status: "confirmed",
    date: "2024-01-08",
    txHash: "0x7c8f9e3d4c2b1a5f9e3d4c2b1a5f7c8f9e3d4c2b",
    blockNumber: 19304567,
  },
  {
    id: "tx-002",
    type: "donation",
    campaignTitle: "Program Beasiswa Anak Kurang Mampu",
    organizationName: "Yayasan Pendidikan Indonesia",
    amount: 500000,
    donorName: "Anonim",
    status: "confirmed",
    date: "2024-01-07",
    txHash: "0x2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s",
    blockNumber: 19304456,
  },
  {
    id: "tx-003",
    type: "distribution",
    campaignTitle: "Kesehatan Ibu dan Anak di Desa Terpencil",
    organizationName: "Klinik Kesehatan Masyarakat",
    amount: 50000000,
    status: "confirmed",
    date: "2024-01-06",
    txHash: "0x9x8y7z6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p",
    blockNumber: 19304345,
  },
  {
    id: "tx-004",
    type: "donation",
    campaignTitle: "Penanaman Hutan Mangrove",
    organizationName: "Gerakan Lingkungan Hijau",
    amount: 2000000,
    donorName: "Siti Nurhaliza",
    status: "pending",
    date: "2024-01-08",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s",
    blockNumber: 0,
  },
  {
    id: "tx-005",
    type: "donation",
    campaignTitle: "Gempa Bumi Lombok - Bantuan Darurat",
    organizationName: "Gerakan Disaster Relief",
    amount: 3500000,
    donorName: "PT. Maju Jaya",
    status: "confirmed",
    date: "2024-01-05",
    txHash: "0x5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x",
    blockNumber: 19304234,
  },
  {
    id: "tx-006",
    type: "distribution",
    campaignTitle: "Program Beasiswa Anak Kurang Mampu",
    organizationName: "Yayasan Pendidikan Indonesia",
    amount: 30000000,
    status: "confirmed",
    date: "2024-01-04",
    txHash: "0x4y3z2a1b0c9d8e7f6g5h4i3j2k1l0m9n8o7p6q",
    blockNumber: 19304123,
  },
]
