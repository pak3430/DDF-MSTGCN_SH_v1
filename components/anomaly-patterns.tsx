"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun, Clock, Coffee, MapPin, AlertTriangle } from "lucide-react"

interface AnomalyPatternsProps {
  district: string
  analysisMonth: string
}

export function AnomalyPatterns({ district, analysisMonth }: AnomalyPatternsProps) {
  const anomalyPatterns = [
    {
      type: "weekend-dominant",
      title: "주말 우세 정류장",
      icon: Sun,
      color: "bg-chart-3",
      stations: [
        { name: "한강공원입구", score: 2.3, reason: "레저 활동" },
        { name: "롯데월드몰", score: 2.1, reason: "쇼핑몰" },
        { name: "올림픽공원", score: 1.9, reason: "공원/문화" },
        { name: "코엑스몰", score: 1.8, reason: "전시/컨벤션" },
        { name: "잠실종합운동장", score: 1.7, reason: "스포츠 경기" },
      ],
    },
    {
      type: "night-demand",
      title: "심야시간 고수요",
      icon: Moon,
      color: "bg-chart-4",
      stations: [
        { name: "홍대입구역", score: 4.2, reason: "유흥가" },
        { name: "강남역", score: 3.8, reason: "상업지구" },
        { name: "신촌역", score: 3.1, reason: "대학가" },
        { name: "이태원역", score: 2.9, reason: "외국인 관광" },
        { name: "건대입구역", score: 2.7, reason: "대학가/유흥" },
      ],
    },
    {
      type: "rush-hour",
      title: "러시아워 집중",
      icon: Clock,
      color: "bg-primary",
      stations: [
        { name: "여의도역", score: 8.9, reason: "금융가" },
        { name: "종각역", score: 8.2, reason: "업무지구" },
        { name: "을지로입구역", score: 7.8, reason: "상업지구" },
        { name: "시청역", score: 7.5, reason: "관공서" },
        { name: "광화문역", score: 7.1, reason: "업무/관공서" },
      ],
    },
    {
      type: "lunch-time",
      title: "점심시간 특화",
      icon: Coffee,
      color: "bg-chart-2",
      stations: [
        { name: "명동역", score: 3.4, reason: "상업지구" },
        { name: "을지로3가역", score: 3.1, reason: "업무지구" },
        { name: "종로3가역", score: 2.9, reason: "상업지구" },
        { name: "충무로역", score: 2.7, reason: "업무지구" },
        { name: "동대문역", score: 2.5, reason: "쇼핑가" },
      ],
    },
    {
      type: "area-type",
      title: "지역 특성별",
      icon: MapPin,
      color: "bg-chart-5",
      stations: [
        { name: "대학로역", score: 4.1, reason: "문화/공연" },
        { name: "이대역", score: 3.7, reason: "대학가" },
        { name: "성신여대입구역", score: 3.3, reason: "대학가" },
        { name: "건국대입구역", score: 3.0, reason: "대학가" },
        { name: "숭실대입구역", score: 2.8, reason: "대학가" },
      ],
    },
    {
      type: "underutilized",
      title: "저활용 정류장",
      icon: AlertTriangle,
      color: "bg-muted",
      stations: [
        { name: "신정네거리역", score: 0.3, reason: "주거지역" },
        { name: "까치산역", score: 0.4, reason: "외곽지역" },
        { name: "개화산역", score: 0.5, reason: "외곽지역" },
        { name: "방화역", score: 0.6, reason: "공항 접근" },
        { name: "김포공항역", score: 0.7, reason: "특수목적" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">특이 패턴 분석</h2>
          <p className="text-muted-foreground">
            {district === "seoul" ? "서울시 전체" : district} 지역의 특별한 교통 패턴을 분석합니다
          </p>
        </div>
        <Badge variant="outline">{analysisMonth}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anomalyPatterns.map((pattern) => {
          const IconComponent = pattern.icon
          return (
            <Card key={pattern.type} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg ${pattern.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  {pattern.title}
                </CardTitle>
                <CardDescription>상위 5개 정류장 (특이도 점수 기준)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pattern.stations.map((station, index) => (
                    <div key={station.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{station.name}</div>
                          <div className="text-xs text-muted-foreground">{station.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{station.score}</div>
                        <div className="text-xs text-muted-foreground">점수</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
