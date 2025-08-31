"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, MapPin, Users, Clock, TrendingUp, Activity, Car, Bus, Accessibility } from "lucide-react"
import SeoulMap from "@/components/seoul-map"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

// Mock data for demonstration
const drtTypes = [
  { id: "commuter", name: "통근형 DRT", icon: Car, color: "bg-blue-500", description: "출퇴근 시간대 집중 운행" },
  { id: "tourism", name: "관광형 DRT", icon: Bus, color: "bg-green-500", description: "관광지 연결 중심 운행" },
  {
    id: "vulnerable",
    name: "교통약자형 DRT",
    icon: Accessibility,
    color: "bg-purple-500",
    description: "고령자, 장애인 대상 운행",
  },
  { id: "night", name: "심야형 DRT", icon: Clock, color: "bg-orange-500", description: "심야 시간대 운행" },
]

const seoulDistricts = [
  { name: "강남구", demand: 85, population: 12000, score: 92 },
  { name: "서초구", demand: 78, population: 10500, score: 88 },
  { name: "송파구", demand: 72, population: 11200, score: 84 },
  { name: "마포구", demand: 68, population: 9800, score: 81 },
  { name: "용산구", demand: 65, population: 8900, score: 78 },
  { name: "성동구", demand: 62, population: 8200, score: 75 },
  { name: "중구", demand: 58, population: 7500, score: 72 },
  { name: "종로구", demand: 55, population: 7200, score: 69 },
  { name: "강서구", demand: 52, population: 9500, score: 66 },
  { name: "양천구", demand: 49, population: 8800, score: 63 },
  { name: "영등포구", demand: 71, population: 9200, score: 79 },
  { name: "동작구", demand: 64, population: 8600, score: 74 },
  { name: "관악구", demand: 61, population: 9100, score: 71 },
  { name: "서대문구", demand: 57, population: 7800, score: 68 },
  { name: "은평구", demand: 54, population: 8400, score: 65 },
  { name: "노원구", demand: 59, population: 10200, score: 70 },
  { name: "도봉구", demand: 51, population: 7600, score: 62 },
  { name: "강북구", demand: 48, population: 7100, score: 59 },
  { name: "성북구", demand: 56, population: 8300, score: 67 },
  { name: "동대문구", demand: 53, population: 7900, score: 64 },
  { name: "중랑구", demand: 50, population: 7400, score: 61 },
  { name: "광진구", demand: 63, population: 8500, score: 73 },
  { name: "강동구", demand: 60, population: 8700, score: 72 },
  { name: "금천구", demand: 47, population: 6800, score: 58 },
  { name: "구로구", demand: 56, population: 8100, score: 67 },
]

const hourlyDemand = [
  { hour: "00", demand: 12 },
  { hour: "03", demand: 8 },
  { hour: "06", demand: 45 },
  { hour: "09", demand: 78 },
  { hour: "12", demand: 65 },
  { hour: "15", demand: 58 },
  { hour: "18", demand: 82 },
  { hour: "21", demand: 38 },
]

const featureAnalysis = [
  { feature: "인구밀도", value: 85, fullMark: 100 },
  { feature: "대중교통 접근성", value: 72, fullMark: 100 },
  { feature: "고령인구 비율", value: 68, fullMark: 100 },
  { feature: "교통 사각지대", value: 78, fullMark: 100 },
  { feature: "경제활동 수준", value: 82, fullMark: 100 },
  { feature: "야간 활동", value: 45, fullMark: 100 },
]

export default function SuitabilityPage() {
  const [selectedDrtType, setSelectedDrtType] = useState("commuter")
  const [selectedDistrict, setSelectedDistrict] = useState("강남구")

  const selectedDistrictData = seoulDistricts.find((d) => d.name === selectedDistrict)

  const districtScores = seoulDistricts.reduce(
    (acc, district) => {
      acc[district.name] = district.score
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="flex h-full">
      {/* Left Panel - DRT Type Selection */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">DRT 유형 선택</h2>
          </div>

          <div className="space-y-3">
            {drtTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedDrtType === type.id

              return (
                <Button
                  key={type.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-4 ${
                    isSelected ? "bg-primary/10 border-primary/20" : ""
                  }`}
                  onClick={() => setSelectedDrtType(type.id)}
                >
                  <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-medium text-sm">필터 옵션</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                인구밀도 기준
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                수요 강도 기준
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <TrendingUp className="w-4 h-4 mr-2" />
                성장 잠재력 기준
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Central Panel - HeatMap */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">DRT 수요 분포 히트맵</h1>
            <p className="text-muted-foreground">
              선택된 DRT 유형: <Badge variant="secondary">{drtTypes.find((t) => t.id === selectedDrtType)?.name}</Badge>
            </p>
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                서울시 구별 DRT 적합도
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <SeoulMap
                selectedDistrict={selectedDistrict}
                onDistrictClick={setSelectedDistrict}
                districtScores={districtScores}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Panel - Analysis */}
        <div className="border-t border-border bg-muted/30">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">선택 지점 분석: {selectedDistrict}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  적합도 점수: {selectedDistrictData?.score}점
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  인구: {selectedDistrictData?.population.toLocaleString()}명
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  수요지수: {selectedDistrictData?.demand}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Feature Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">특성별 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={featureAnalysis}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="feature" className="text-xs" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                        <Radar
                          name="점수"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Hourly Demand Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">시간대별 수요 패턴</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourlyDemand}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="demand"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
