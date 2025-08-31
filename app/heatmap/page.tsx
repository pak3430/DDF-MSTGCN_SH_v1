"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeatmapView } from "@/components/heatmap-view"

export default function HeatmapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState("seoul")
  const [analysisMonth, setAnalysisMonth] = useState("2025-07")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seoul">서울시 전체</SelectItem>
            <SelectItem value="gangnam">강남구</SelectItem>
            <SelectItem value="gangbuk">강북구</SelectItem>
            <SelectItem value="mapo">마포구</SelectItem>
          </SelectContent>
        </Select>

        <Select value={analysisMonth} onValueChange={setAnalysisMonth}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Analysis Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-07">2025년 7월</SelectItem>
            <SelectItem value="2025-06">2025년 6월</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <HeatmapView district={selectedDistrict} analysisMonth={analysisMonth} />
    </div>
  )
}
