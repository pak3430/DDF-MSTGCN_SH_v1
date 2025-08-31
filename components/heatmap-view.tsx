"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Building } from "lucide-react"
import { apiService, TopDistrict, TopStation } from "@/lib/api"
import { DistrictMapWrapper } from "./map/district-map-wrapper"

interface HeatmapViewProps {
  district: string
  analysisMonth: string
}

export function HeatmapView({ district, analysisMonth }: HeatmapViewProps) {
  const [topDistricts, setTopDistricts] = useState<TopDistrict[]>([])
  const [topStations, setTopStations] = useState<TopStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await apiService.getHeatmapData(district, analysisMonth)
        
        setTopDistricts(data.top_districts)
        setTopStations(data.top_stations)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch heatmap data')
        
        const fallbackDistricts: TopDistrict[] = [
          { district_name: "강남구", total_traffic: 10374028, rank: 1, traffic_density: 10541.5, station_count: 984 },
          { district_name: "서초구", total_traffic: 8234567, rank: 2, traffic_density: 8234.2, station_count: 756 },
          { district_name: "송파구", total_traffic: 7456789, rank: 3, traffic_density: 7123.4, station_count: 689 },
          { district_name: "영등포구", total_traffic: 6789012, rank: 4, traffic_density: 6456.8, station_count: 612 },
          { district_name: "마포구", total_traffic: 5678901, rank: 5, traffic_density: 5234.1, station_count: 534 },
        ]
        
        const fallbackStations: TopStation[] = [
          { station_name: "지하철2호선강남역", total_traffic: 125847, daily_average: 4059.26, district: "강남구" },
          { station_name: "지하철2호선서초역", total_traffic: 98234, daily_average: 3169.48, district: "서초구" },
          { station_name: "지하철9호선고속터미널역", total_traffic: 87456, daily_average: 2821.16, district: "서초구" },
          { station_name: "지하철1호선서울역", total_traffic: 76543, daily_average: 2469.77, district: "중구" },
          { station_name: "지하철4호선사당역", total_traffic: 65432, daily_average: 2110.71, district: "동작구" },
        ]
        
        setTopDistricts(fallbackDistricts)
        setTopStations(fallbackStations)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [district, analysisMonth])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <div className="text-sm">⚠️ API 연결 실패: {error}</div>
              <Badge variant="secondary">Mock 데이터 사용 중</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            서울시 교통량 히트맵
            <Badge variant="outline">{analysisMonth}</Badge>
            {error && <Badge variant="destructive">오프라인</Badge>}
          </CardTitle>
          <CardDescription>구별 및 정류장별 교통 밀도 시각화 (클릭하여 상세 정보 확인)</CardDescription>
        </CardHeader>
        <CardContent>
          <DistrictMapWrapper 
            selectedDistrict={district} 
            onDistrictSelect={(selectedDistrict) => {
              // 부모 컴포넌트의 district 상태를 업데이트할 수 있도록 콜백 추가
              console.log('선택된 자치구:', selectedDistrict)
            }} 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Districts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              구별 교통량 TOP 5
            </CardTitle>
            <CardDescription>월간 총 교통량 기준 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDistricts.map((district, index) => (
                <div key={district.district_name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === 1
                            ? "bg-chart-2 text-white"
                            : index === 2
                              ? "bg-chart-3 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {district.rank}
                    </div>
                    <div>
                      <div className="font-semibold">{district.district_name}</div>
                      <div className="text-sm text-muted-foreground">정류장 {district.station_count}개</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{(district.total_traffic / 10000).toFixed(0)}만명</div>
                    <div className="text-sm text-muted-foreground">밀도 {district.traffic_density.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Stations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              정류장별 교통량 TOP 5
            </CardTitle>
            <CardDescription>월간 총 교통량 기준 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStations.map((station, index) => (
                <div key={station.station_name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === 1
                            ? "bg-chart-2 text-white"
                            : index === 2
                              ? "bg-chart-3 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{station.station_name}</div>
                      <div className="text-xs text-muted-foreground">{station.district}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{(station.total_traffic / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">일평균 {station.daily_average.toFixed(0)}명</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
