"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, SlidersHorizontal, Trash2, Zap } from "lucide-react"

const categories = [
  { value: "bencana_alam", label: "Bencana Alam" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "lingkungan", label: "Lingkungan" },
  { value: "sosial", label: "Sosial" },
  { value: "ekonomi", label: "Ekonomi" },
]

const statuses = [
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" }
]

const sortOptions = [
  { value: "terbaru", label: "TERBARU" },
  { value: "populer", label: "PALING POPULER" },
  { value: "deadline", label: "DEADLINE TERDEKAT" },
]

interface FilterSidebarProps {
  selectedCategory: string | null
  selectedStatus: string | null
  sortBy: string
  onCategoryChange: (category: string | null) => void
  onStatusChange: (status: string | null) => void
  onSortChange: (sort: string) => void
  isOpen?: boolean
  onToggle?: (open: boolean) => void
}

export function FilterSidebar({
  selectedCategory,
  selectedStatus,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  isOpen = true,
  onToggle,
}: FilterSidebarProps) {
  const handleReset = () => {
    onCategoryChange(null)
    onStatusChange(null)
    onSortChange("terbaru")
  }

  const content = (
    <div className="space-y-6">
      {/* HEADER SECTION - Padding dikurangin */}
      <div className="flex items-center gap-2 pb-3 border-b-2 border-dashed border-slate-200">
        <div className="bg-blue-600 p-1.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-black uppercase italic tracking-tighter text-slate-900 text-base">Filter</h3>
      </div>

      {/* SORT SECTION */}
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Urutkan</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full bg-white border-2 border-slate-900 rounded-xl h-10 px-3 text-xs font-bold uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="font-bold uppercase italic text-[10px] py-2 focus:bg-blue-50">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KATEGORI SECTION - Menggunakan Grid 1 kolom tapi padding dipersempit */}
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kategori</label>
        <div className="grid grid-cols-1 gap-2">
          {categories.map((cat) => (
            <div 
              key={cat.value} 
              className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all ${
                selectedCategory === cat.value 
                ? "bg-blue-50 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]" 
                : "bg-white border-slate-200 hover:border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]"
              }`}
              onClick={() => onCategoryChange(selectedCategory === cat.value ? null : cat.value)}
            >
              <Checkbox
                id={`category-${cat.value}`}
                checked={selectedCategory === cat.value}
                className="w-4 h-4 border-2 border-slate-900 rounded transition-none flex-shrink-0"
              />
              <label htmlFor={`category-${cat.value}`} className="text-[11px] font-black uppercase italic tracking-tight cursor-pointer leading-none truncate">
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* STATUS SECTION - Menggunakan flex-wrap agar tidak keluar jalur */}
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(selectedStatus === status.value ? null : status.value)}
              className={`px-3 py-1.5 border-2 border-slate-900 rounded-lg font-black uppercase italic text-[9px] transition-all flex-1 min-w-[80px] ${
                selectedStatus === status.value 
                ? "bg-yellow-400 translate-x-0.5 translate-y-0.5 shadow-none" 
                : "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESET BUTTON */}
      {(selectedCategory || selectedStatus || sortBy !== "terbaru") && (
        <Button 
          variant="outline" 
          className="w-full h-10 mt-4 border-2 border-slate-900 bg-red-50 hover:bg-red-100 text-red-600 font-black uppercase italic tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(220,38,38,0.2)]"
          onClick={handleReset}
        >
          <Trash2 className="w-3 h-3 mr-2" />
          Reset
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block w-full max-w-[280px]">
        <div className="sticky top-24 p-5 bg-white border-4 border-slate-900 rounded-[1.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {content}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden">
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" onClick={() => onToggle?.(false)}>
            <div 
              className="fixed left-0 top-0 w-[260px] h-full bg-white border-r-4 border-slate-900 p-6 z-[70] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">FILTER</h2>
                <button 
                  onClick={() => onToggle?.(false)}
                  className="p-1.5 border-2 border-slate-900 rounded-lg bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <X className="w-4 h-4 stroke-[3px]" />
                </button>
              </div>
              {content}
            </div>
          </div>
        )}
      </div>
    </>
  )
}