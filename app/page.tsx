"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, MapPin, Activity } from "lucide-react"
import { apiService } from "@/lib/api"

interface DashboardData {
  total_passengers: number
  daily_average: number
  peak_hour_traffic: number
  active_stations: number
  weekday_weekend_ratio: number
  top_district: string
}

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await apiService.getDashboardSummary()
        setDashboardData(data)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        
        const fallbackData: DashboardData = {
          total_passengers: 95234567,
          daily_average: 3072405,
          peak_hour_traffic: 24.2,
          active_stations: 20590,
          weekday_weekend_ratio: 1.47,
          top_district: "강남구",
        }
        setDashboardData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const kpiData = dashboardData || {
    total_passengers: 0,
    daily_average: 0,
    peak_hour_traffic: 0,
    active_stations: 0,
    weekday_weekend_ratio: 0,
    top_district: "",
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-foreground">대시보드 개요</h2>
          {error && <Badge variant="destructive">오프라인</Badge>}
        </div>
        <p className="text-muted-foreground">서울시 DRT 시스템의 주요 지표와 현황을 확인하세요.</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 승객수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData.total_passengers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">일평균 {kpiData.daily_average.toLocaleString()}명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">피크 시간 교통량</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{kpiData.peak_hour_traffic}만명</div>
            <p className="text-xs text-muted-foreground">오전 8시 기준</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 정류장</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-5">{kpiData.active_stations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">서울시 전체</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평일/주말 비율</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{kpiData.weekday_weekend_ratio}:1</div>
            <p className="text-xs text-muted-foreground">최고 구역: {kpiData.top_district}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
