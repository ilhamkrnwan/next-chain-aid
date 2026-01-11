"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getAllTransactionsFromBlockchain } from "@/lib/admin-blockchain"

interface ChartData {
  month: string
  donasi: number
}

export function DonationChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDonationData()
  }, [])

  async function loadDonationData() {
    try {
      const transactions = await getAllTransactionsFromBlockchain()
      
      // Group donations by month
      const monthlyData: Record<string, number> = {}
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      
      transactions
        .filter(tx => tx.type === 'donation')
        .forEach(tx => {
          const date = new Date(tx.timestamp * 1000)
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
          const amount = parseFloat(tx.amount)
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0
          }
          monthlyData[monthKey] += amount
        })

      // Convert to chart data format (last 6 months)
      const chartData: ChartData[] = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        
        chartData.push({
          month: monthNames[date.getMonth()],
          donasi: monthlyData[monthKey] || 0,
        })
      }

      setData(chartData)
    } catch (error) {
      console.error('Failed to load donation data:', error)
      // Set empty data on error
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donasi per Bulan (ETH)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0 || data.every(d => d.donasi === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donasi per Bulan (ETH)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Belum ada data donasi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donasi per Bulan (ETH)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(4)} ETH`}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="donasi"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
