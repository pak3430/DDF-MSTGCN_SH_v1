"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Moon, 
  Sun, 
  Clock, 
  UtensilsCrossed, 
  Home, 
  Building, 
  TrendingDown,
  MapPin,
  AlertTriangle,
  BarChart3,
  Calendar
} from "lucide-react"
import { 
  apiService, 
  IntegratedAnomalyPatterns
} from "@/lib/api"

interface AnomalyPatternsViewProps {
  district: string
  analysisMonth: string
}

export function AnomalyPatternsView({ district, analysisMonth }: AnomalyPatternsViewProps) {
  const [data, setData] = useState<IntegratedAnomalyPatterns | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("weekend")

  useEffect(() => {
    const fetchAnomalyPatterns = async () => {
      if (district === 'seoul') return // 서울시 전체는 지원하지 않음
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getIntegratedAnomalyPatterns(district, analysisMonth, 5)
        setData(response.data)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch anomaly patterns')
        console.error('Anomaly patterns error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalyPatterns()
  }, [district, analysisMonth])

  if (district === 'seoul') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <p>특이패턴 분석은 구별로만 제공됩니다.</p>
            <p className="text-sm mt-1">지도에서 특정 구를 선택해주세요.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-semibold">특이패턴 분석 오류</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4" />
            <p>특이패턴 데이터가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {data.district_name} 교통 특이패턴 분석
            <Badge variant="outline" className="ml-2">
              <Calendar className="w-3 h-3 mr-1" />
              {data.analysis_month}
            </Badge>
          </CardTitle>
          <CardDescription>
            6가지 교통 패턴 분석을 통한 지역 특성 파악
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="weekend" className="text-xs">
            <Sun className="w-3 h-3 mr-1" />
            주말
          </TabsTrigger>
          <TabsTrigger value="night" className="text-xs">
            <Moon className="w-3 h-3 mr-1" />
            심야
          </TabsTrigger>
          <TabsTrigger value="rush" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            러시아워
          </TabsTrigger>
          <TabsTrigger value="lunch" className="text-xs">
            <UtensilsCrossed className="w-3 h-3 mr-1" />
            점심
          </TabsTrigger>
          <TabsTrigger value="area" className="text-xs">
            <Home className="w-3 h-3 mr-1" />
            지역성
          </TabsTrigger>
          <TabsTrigger value="underutilized" className="text-xs">
            <TrendingDown className="w-3 h-3 mr-1" />
            저활용
          </TabsTrigger>
        </TabsList>

        {/* 주말 우세 정류장 */}
        <TabsContent value="weekend">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                주말 우세 정류장 TOP 5
              </CardTitle>
              <CardDescription>
                주말 교통량이 높은 관광지/레저 정류장
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.weekend_dominant_stations.map((station, index) => (
                    <div key={station.station.station_id} className="p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={index < 2 ? "default" : "secondary"}>
                              #{station.rank}
                            </Badge>
                            <h4 className="font-semibold text-sm">{station.station.station_name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {station.station.district_name} · {station.station.administrative_dong}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">주말 총 교통량</span>
                              <p className="font-semibold text-primary">
                                {station.weekend_total_traffic.toLocaleString()}명
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">구 평균 대비</span>
                              <p className="font-semibold text-amber-600">
                                {station.vs_district_avg.toFixed(1)}배
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">피크 시간대</span>
                            <div className="flex gap-1 mt-1">
                              {station.weekend_peak_hours.map((hour, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {hour}시: {station.weekend_peak_traffic[i]?.toLocaleString()}명
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 심야시간 고수요 정류장 */}
        <TabsContent value="night">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-500" />
                심야시간 고수요 정류장 TOP 5
              </CardTitle>
              <CardDescription>
                23:00-03:00 승차인원이 높은 정류장
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.night_demand_stations.map((station, index) => (
                    <div key={station.station.station_id} className="p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={index < 2 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <h4 className="font-semibold text-sm">{station.station.station_name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {station.station.district_name} · {station.station.administrative_dong}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">심야 총 승차</span>
                              <p className="font-semibold text-primary">
                                {station.total_night_ride.toLocaleString()}명
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">구 평균 대비</span>
                              <p className="font-semibold text-blue-600">
                                {station.vs_district_avg.toFixed(1)}배
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">시간대별 승차량</span>
                            <div className="flex gap-1 mt-1">
                              {['23시', '00시', '01시', '02시', '03시'].map((time, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {time}: {station.night_hours_traffic[i]?.toLocaleString()}명
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 러시아워 고수요 정류장 */}
        <TabsContent value="rush">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 오전 러시아워 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  오전 러시아워 (06-08시)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {data.rush_hour_stations.morning_rush.map((station, index) => (
                      <div key={station.station.station_id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index < 2 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <h5 className="font-semibold text-sm">{station.station.station_name}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">총 승차량</span>
                            <p className="font-semibold text-primary">
                              {station.total_morning_rush.toLocaleString()}명
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">구 평균 대비</span>
                            <p className="font-semibold text-orange-600">
                              {station.vs_district_avg.toFixed(1)}배
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 오후 러시아워 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  오후 러시아워 (17-19시)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {data.rush_hour_stations.evening_rush.map((station, index) => (
                      <div key={station.station.station_id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index < 2 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <h5 className="font-semibold text-sm">{station.station.station_name}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">총 승차량</span>
                            <p className="font-semibold text-primary">
                              {station.total_evening_rush.toLocaleString()}명
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">구 평균 대비</span>
                            <p className="font-semibold text-red-600">
                              {station.vs_district_avg.toFixed(1)}배
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 점심시간 특화 정류장 */}
        <TabsContent value="lunch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-green-500" />
                점심시간 특화 정류장 TOP 5
              </CardTitle>
              <CardDescription>
                11:00-13:00 하차인원이 높은 음식점가/상업지구
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.lunch_time_stations.map((station, index) => (
                    <div key={station.station.station_id} className="p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={index < 2 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <h4 className="font-semibold text-sm">{station.station.station_name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {station.station.district_name} · {station.station.administrative_dong}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">점심시간 하차</span>
                              <p className="font-semibold text-primary">
                                {station.total_lunch_alight.toLocaleString()}명
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">구 평균 대비</span>
                              <p className="font-semibold text-green-600">
                                {station.vs_district_avg.toFixed(1)}배
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">시간대별 하차량</span>
                            <div className="flex gap-1 mt-1">
                              {['11시', '12시', '13시'].map((time, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {time}: {station.lunch_hours_alight[i]?.toLocaleString()}명
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 지역 특성별 정류장 */}
        <TabsContent value="area">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 주거지역 정류장 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-500" />
                  주거지역 정류장 TOP 5
                </CardTitle>
                <CardDescription>
                  출근시 승차&gt;&gt;하차, 퇴근시 하차&gt;&gt;승차
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {data.area_type_analysis.residential_stations.map((station, index) => (
                      <div key={station.station.station_id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index < 2 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <h5 className="font-semibold text-sm">{station.station.station_name}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">불균형 비율</span>
                            <p className="font-semibold text-blue-600">
                              {station.imbalance_ratio.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">총 교통량</span>
                            <p className="font-semibold text-primary">
                              {station.total_traffic.toLocaleString()}명
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 업무지역 정류장 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-500" />
                  업무지역 정류장 TOP 5
                </CardTitle>
                <CardDescription>
                  출근시 하차&gt;&gt;승차, 퇴근시 승차&gt;&gt;하차
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {data.area_type_analysis.business_stations.map((station, index) => (
                      <div key={station.station.station_id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index < 2 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <h5 className="font-semibold text-sm">{station.station.station_name}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">불균형 비율</span>
                            <p className="font-semibold text-purple-600">
                              {station.imbalance_ratio.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">총 교통량</span>
                            <p className="font-semibold text-primary">
                              {station.total_traffic.toLocaleString()}명
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 저활용 정류장 */}
        <TabsContent value="underutilized">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-gray-500" />
                저활용 정류장 TOP 10
              </CardTitle>
              <CardDescription>
                운영 최적화 및 효율성 개선 대상 정류장
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.underutilized_stations.map((station, index) => (
                    <div key={station.station.station_id} className="p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              #{index + 1}
                            </Badge>
                            <h4 className="font-semibold text-sm">{station.station.station_name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {station.station.district_name} · {station.station.administrative_dong}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">일평균 승객</span>
                              <p className="font-semibold text-primary">
                                {station.avg_daily_passengers}명
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">활용률</span>
                              <p className="font-semibold text-gray-600">
                                {station.utilization_rate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">효율성 점수</span>
                              <p className="font-semibold text-gray-600">
                                {station.efficiency_score.toFixed(1)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-muted-foreground">
                                연결 노선: <span className="font-semibold">{station.connecting_routes}개</span>
                              </span>
                              <span className="text-muted-foreground">
                                최대 일일 승객: <span className="font-semibold">{station.max_daily_passengers}명</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}