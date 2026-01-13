"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Calendar, Zap, Image as ImageIcon, ClipboardCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Update {
  id: string
  title: string
  content: string
  image_url?: string
  created_at: string
}

interface ProgressUpdatesProps {
  campaignId: string
}

export function ProgressUpdates({ campaignId }: ProgressUpdatesProps) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpdates()
  }, [campaignId])

  const loadUpdates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUpdates(data || [])
    } catch (error) {
      console.error('Failed to load updates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 pl-8 border-l-4 border-slate-100">
        {[1, 2].map((i) => (
          <div key={i} className="relative">
             <div className="absolute -left-[42px] top-0 w-8 h-8 bg-slate-100 border-4 border-white rounded-full" />
             <Card className="p-6 border-4 border-slate-100 shadow-none">
                <div className="flex gap-6">
                  <Skeleton className="w-32 h-32 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24 bg-slate-100" />
                    <Skeleton className="h-8 w-64 bg-slate-100" />
                    <Skeleton className="h-4 w-full bg-slate-100" />
                  </div>
                </div>
             </Card>
          </div>
        ))}
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <Card className="p-12 border-4 border-dashed border-slate-300 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-4 border-2 border-slate-900 rounded-2xl mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ClipboardCheck className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">
          BELUM ADA UPDATE PROGRES
        </p>
      </Card>
    )
  }

  return (
    <div className="relative space-y-12 pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-slate-900 before:rounded-full">
      {updates.map((update, index) => (
        <div key={update.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[40px] top-0 w-10 h-10 bg-blue-600 border-4 border-slate-900 rounded-full z-10 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>

          <Card className="relative overflow-hidden border-4 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
              {/* Update Image */}
              {update.image_url ? (
                <div className="relative w-full md:w-48 h-48 flex-shrink-0 group-hover:rotate-1 transition-transform">
                   <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1 translate-y-1" />
                   <div className="relative h-full w-full rounded-2xl border-2 border-slate-900 overflow-hidden">
                    <Image
                        src={update.image_url}
                        alt={update.title}
                        fill
                        className="object-cover"
                      />
                   </div>
                </div>
              ) : (
                <div className="w-full md:w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}

              {/* Update Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border-2 border-blue-200 rounded-full w-fit">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 stroke-[3px]" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {new Date(update.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long", // PERBAIKAN: Harus huruf kecil "long"
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                    {update.title}
                  </h3>
                  <div className="w-12 h-1.5 bg-yellow-400 border-2 border-slate-900 rounded-full" />
                </div>

                <p className="text-sm font-bold text-slate-600 leading-relaxed italic uppercase tracking-tight">
                  {update.content}
                </p>
              </div>
            </div>
            
            {/* Index Badge */}
            <div className="absolute bottom-0 right-0 bg-slate-900 text-white px-4 py-1 rounded-tl-2xl font-black italic text-xs">
              UPDATE #{updates.length - index}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}