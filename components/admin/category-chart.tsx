"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { createClient } from "@/lib/supabase/client"
import type { CampaignCategory } from "@/lib/types"

interface CategoryData {
  name: string
  value: number
  color: string
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ef4444", // red
]

const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  kesehatan: "Kesehatan",
  pendidikan: "Pendidikan",
  bencana_alam: "Bencana Alam",
  lingkungan: "Lingkungan",
  sosial: "Sosial",
  ekonomi: "Ekonomi",
  lainnya: "Lainnya",
}

export function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategoryData()
  }, [])

  async function loadCategoryData() {
    try {
      const supabase = createClient()
      
      // Get all campaigns
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('category')

      if (error) throw error

      // Count by category
      const categoryCounts: Record<string, number> = {}
      campaigns?.forEach(campaign => {
        const category = campaign.category || 'lainnya'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      // Convert to chart data
      const chartData: CategoryData[] = Object.entries(categoryCounts)
        .map(([category, count], index) => ({
          name: CATEGORY_LABELS[category as CampaignCategory] || category,
          value: count,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)

      setData(chartData)
    } catch (error) {
      console.error('Failed to load category data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[250px]" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <p>Belum ada data campaign</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={90} 
              paddingAngle={2} 
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `${value} campaign`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
