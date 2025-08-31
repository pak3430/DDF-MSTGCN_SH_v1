"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { apiService } from "@/lib/api"

interface TrafficChartProps {
  district: string
  analysisMonth: string
}

export function TrafficChart({ district, analysisMonth }: TrafficChartProps) {
  const [trafficData, setTrafficData] = useState<Array<{ hour: number; weekday: number; weekend: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [peakHours, setPeakHours] = useState({
    weekdayMorning: { hour: 0, passengers: 0 },
    weekdayEvening: { hour: 0, passengers: 0 },
    weekend: { hour: 0, passengers: 0 },
  })

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await apiService.getTrafficPatterns(district, analysisMonth)
        
        const formattedData = data.weekday_patterns.map((weekdayItem, index) => ({
          hour: weekdayItem.hour,
          weekday: weekdayItem.avg_total_passengers,
          weekend: data.weekend_patterns[index]?.avg_total_passengers || 0
        }))
        
        setTrafficData(formattedData)
        
        setPeakHours({
          weekdayMorning: { 
            hour: data.peak_hours.weekday_morning_peak.hour, 
            passengers: data.peak_hours.weekday_morning_peak.avg_total_passengers 
          },
          weekdayEvening: { 
            hour: data.peak_hours.weekday_evening_peak.hour, 
            passengers: data.peak_hours.weekday_evening_peak.avg_total_passengers 
          },
          weekend: { 
            hour: data.peak_hours.weekend_peak.hour, 
            passengers: data.peak_hours.weekend_peak.avg_total_passengers 
          },
        })
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch traffic data')
        
        const fallbackData = [
          { hour: 0, weekday: 1.71, weekend: 1.81 },
          { hour: 1, weekday: 1.2, weekend: 1.3 },
          { hour: 2, weekday: 0.8, weekend: 0.9 },
          { hour: 3, weekday: 0.6, weekend: 0.7 },
          { hour: 4, weekday: 0.9, weekend: 0.8 },
          { hour: 5, weekday: 2.1, weekend: 1.2 },
          { hour: 6, weekday: 5.8, weekend: 2.1 },
          { hour: 7, weekday: 12.4, weekend: 3.2 },
          { hour: 8, weekday: 24.17, weekend: 4.8 },
          { hour: 9, weekday: 18.2, weekend: 6.2 },
          { hour: 10, weekday: 12.8, weekend: 8.4 },
          { hour: 11, weekday: 11.2, weekend: 9.8 },
          { hour: 12, weekday: 13.4, weekend: 11.2 },
          { hour: 13, weekday: 12.1, weekend: 10.8 },
          { hour: 14, weekday: 11.8, weekend: 11.4 },
          { hour: 15, weekday: 13.2, weekend: 12.1 },
          { hour: 16, weekday: 15.8, weekend: 12.8 },
          { hour: 17, weekday: 19.4, weekend: 13.7 },
          { hour: 18, weekday: 23.2, weekend: 12.4 },
          { hour: 19, weekday: 18.6, weekend: 11.2 },
          { hour: 20, weekday: 14.2, weekend: 9.8 },
          { hour: 21, weekday: 10.8, weekend: 8.4 },
          { hour: 22, weekday: 7.2, weekend: 6.8 },
          { hour: 23, weekday: 4.1, weekend: 4.2 },
        ]
        setTrafficData(fallbackData)
        setPeakHours({
          weekdayMorning: { hour: 8, passengers: 24.2 },
          weekdayEvening: { hour: 18, passengers: 23.2 },
          weekend: { hour: 17, passengers: 13.7 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTrafficData()
  }, [district, analysisMonth])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">평일 오전 피크</CardTitle>
            <CardDescription>가장 높은 교통량 시간대</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{peakHours.weekdayMorning.hour}시</div>
            <p className="text-sm text-muted-foreground">{peakHours.weekdayMorning.passengers.toFixed(1)}만명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">평일 저녁 피크</CardTitle>
            <CardDescription>두 번째 높은 교통량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">{peakHours.weekdayEvening.hour}시</div>
            <p className="text-sm text-muted-foreground">{peakHours.weekdayEvening.passengers.toFixed(1)}만명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">주말 피크</CardTitle>
            <CardDescription>주말 최고 교통량</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-5">{peakHours.weekend.hour}시</div>
            <p className="text-sm text-muted-foreground">{peakHours.weekend.passengers.toFixed(1)}만명</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            24시간 교통 패턴 분석
            <Badge variant="outline">{district === "seoul" ? "서울시 전체" : district}</Badge>
            {error && <Badge variant="destructive">오프라인</Badge>}
          </CardTitle>
          <CardDescription>시간대별 평균 승객수 (단위: 만명) - {analysisMonth}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" className="text-muted-foreground" tickFormatter={(value) => `${value}시`} />
                <YAxis className="text-muted-foreground" tickFormatter={(value) => `${value}만`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}만명`, name === "weekday" ? "평일" : "주말"]}
                  labelFormatter={(label) => `${label}시`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend formatter={(value) => (value === "weekday" ? "평일" : "주말")} />
                <Line
                  type="monotone"
                  dataKey="weekday"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="weekend"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
