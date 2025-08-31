"use client"

import { useState } from "react"

interface SeoulMapProps {
  selectedDistrict: string
  onDistrictClick: (district: string) => void
  districtScores: Record<string, number>
}

// Simplified Seoul district boundaries (SVG paths)
const seoulDistricts = {
  강남구: { path: "M300,250 L350,250 L350,300 L300,300 Z", center: { x: 325, y: 275 } },
  서초구: { path: "M250,250 L300,250 L300,300 L250,300 Z", center: { x: 275, y: 275 } },
  송파구: { path: "M350,250 L400,250 L400,300 L350,300 Z", center: { x: 375, y: 275 } },
  마포구: { path: "M200,150 L250,150 L250,200 L200,200 Z", center: { x: 225, y: 175 } },
  용산구: { path: "M250,200 L300,200 L300,250 L250,250 Z", center: { x: 275, y: 225 } },
  성동구: { path: "M300,150 L350,150 L350,200 L300,200 Z", center: { x: 325, y: 175 } },
  중구: { path: "M250,150 L300,150 L300,200 L250,200 Z", center: { x: 275, y: 175 } },
  종로구: { path: "M200,100 L250,100 L250,150 L200,150 Z", center: { x: 225, y: 125 } },
  강서구: { path: "M100,150 L150,150 L150,200 L100,200 Z", center: { x: 125, y: 175 } },
  양천구: { path: "M150,150 L200,150 L200,200 L150,200 Z", center: { x: 175, y: 175 } },
  영등포구: { path: "M200,200 L250,200 L250,250 L200,250 Z", center: { x: 225, y: 225 } },
  동작구: { path: "M200,250 L250,250 L250,300 L200,300 Z", center: { x: 225, y: 275 } },
  관악구: { path: "M150,250 L200,250 L200,300 L150,300 Z", center: { x: 175, y: 275 } },
  서대문구: { path: "M150,100 L200,100 L200,150 L150,150 Z", center: { x: 175, y: 125 } },
  은평구: { path: "M100,100 L150,100 L150,150 L100,150 Z", center: { x: 125, y: 125 } },
  노원구: { path: "M300,50 L350,50 L350,100 L300,100 Z", center: { x: 325, y: 75 } },
  도봉구: { path: "M250,50 L300,50 L300,100 L250,100 Z", center: { x: 275, y: 75 } },
  강북구: { path: "M200,50 L250,50 L250,100 L200,100 Z", center: { x: 225, y: 75 } },
  성북구: { path: "M250,100 L300,100 L300,150 L250,150 Z", center: { x: 275, y: 125 } },
  동대문구: { path: "M300,100 L350,100 L350,150 L300,150 Z", center: { x: 325, y: 125 } },
  중랑구: { path: "M350,100 L400,100 L400,150 L350,150 Z", center: { x: 375, y: 125 } },
  광진구: { path: "M350,150 L400,150 L400,200 L350,200 Z", center: { x: 375, y: 175 } },
  강동구: { path: "M400,200 L450,200 L450,250 L400,250 Z", center: { x: 425, y: 225 } },
  금천구: { path: "M100,250 L150,250 L150,300 L100,300 Z", center: { x: 125, y: 275 } },
  구로구: { path: "M150,200 L200,200 L200,250 L150,250 Z", center: { x: 175, y: 225 } },
}

const getColorByScore = (score: number) => {
  if (score >= 85) return "#ef4444" // High demand - red
  if (score >= 75) return "#f97316" // Medium-high demand - orange
  if (score >= 65) return "#eab308" // Medium demand - yellow
  if (score >= 55) return "#22c55e" // Low-medium demand - green
  return "#3b82f6" // Low demand - blue
}

export default function SeoulMap({ selectedDistrict, onDistrictClick, districtScores }: SeoulMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
        <svg
          viewBox="0 0 550 350"
          className="w-full h-full max-w-4xl max-h-96"
          style={{ filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))" }}
        >
          {/* District boundaries */}
          {Object.entries(seoulDistricts).map(([districtName, districtData]) => {
            const score = districtScores[districtName] || 50
            const isSelected = selectedDistrict === districtName
            const isHovered = hoveredDistrict === districtName

            return (
              <g key={districtName}>
                <path
                  d={districtData.path}
                  fill={getColorByScore(score)}
                  stroke={isSelected ? "#0ea5e9" : "#64748b"}
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isHovered ? 0.8 : 0.7}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => onDistrictClick(districtName)}
                  onMouseEnter={() => setHoveredDistrict(districtName)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
                <text
                  x={districtData.center.x}
                  y={districtData.center.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-white pointer-events-none"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
                >
                  {districtName}
                </text>
                <text
                  x={districtData.center.x}
                  y={districtData.center.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-white pointer-events-none"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
                >
                  {score}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
          <span>85+ (매우 높음)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }}></div>
          <span>75-84 (높음)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }}></div>
          <span>65-74 (보통)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></div>
          <span>55-64 (낮음)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
          <span>~54 (매우 낮음)</span>
        </div>
      </div>
    </div>
  )
}
