"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Car, 
  Camera, 
  Users, 
  MapPin,
  Clock,
  BarChart3,
  Target,
  AlertTriangle,
  Star,
  Calendar
} from "lucide-react"
import { 
  apiService, 
  DistrictDRTScoreData,
  StationDRTDetail,
  DRTModelsResponse
} from "@/lib/api"

interface DRTScoreViewProps {
  district: string
  analysisMonth: string
}

export function DRTScoreView({ district, analysisMonth }: DRTScoreViewProps) {
  const [districtData, setDistrictData] = useState<DistrictDRTScoreData | null>(null)
  const [stationDetail, setStationDetail] = useState<StationDRTDetail | null>(null)
  const [models, setModels] = useState<DRTModelsResponse | null>(null)
  const [selectedModel, setSelectedModel] = useState<'commuter' | 'tourism' | 'vulnerable'>('commuter')
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 모델 정보 로드
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsData = await apiService.getDRTModels()
        setModels(modelsData)
      } catch (err) {
        console.error('Models fetch error:', err)
      }
    }
    
    fetchModels()
  }, [])

  // 구별 DRT 점수 로드
  useEffect(() => {
    const fetchDistrictDRTScores = async () => {
      if (district === 'seoul') return
      
      try {
        setLoading(true)
        setError(null)
        
        const data = await apiService.getDistrictDRTScores(district, selectedModel, analysisMonth)
        setDistrictData(data)
        
        // 첫 번째 정류장 자동 선택
        if (data.top_stations.length > 0) {
          setSelectedStation(data.top_stations[0].station_id)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch DRT scores')
        console.error('DRT scores error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDistrictDRTScores()
  }, [district, selectedModel, analysisMonth])

  // 정류장 상세 정보 로드
  useEffect(() => {
    const fetchStationDetail = async () => {
      if (!selectedStation) return
      
      try {
        const detail = await apiService.getStationDRTDetail(selectedStation, selectedModel, analysisMonth)
        setStationDetail(detail)
      } catch (err) {
        console.error('Station detail error:', err)
        setStationDetail(null)
      }
    }

    fetchStationDetail()
  }, [selectedStation, selectedModel, analysisMonth])

  if (district === 'seoul') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <p>DRT 점수 분석은 구별로만 제공됩니다.</p>
            <p className="text-sm mt-1">지도에서 특정 구를 선택해주세요.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
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
            <p className="text-destructive font-semibold">DRT 점수 분석 오류</p>
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

  if (!districtData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4" />
            <p>DRT 점수 데이터가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'commuter': return <Car className="w-4 h-4" />
      case 'tourism': return <Camera className="w-4 h-4" />
      case 'vulnerable': return <Users className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 모델 선택 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {districtData.district_name} DRT 점수 분석
              <Badge variant="outline" className="ml-2">
                <Calendar className="w-3 h-3 mr-1" />
                {districtData.analysis_month}
              </Badge>
            </CardTitle>
            <CardDescription>
              Demand Responsive Transit 점수 기반 대중교통 최적화 분석
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">분석 모델:</span>
              <Select
                value={selectedModel}
                onValueChange={(value: 'commuter' | 'tourism' | 'vulnerable') => setSelectedModel(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commuter">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      출퇴근형
                    </div>
                  </SelectItem>
                  <SelectItem value="tourism">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      관광특화형
                    </div>
                  </SelectItem>
                  <SelectItem value="vulnerable">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      교통취약지형
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 모델 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getModelIcon(selectedModel)}
              {models?.models.find(m => m.type === selectedModel)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {models?.models.find(m => m.type === selectedModel)?.description}
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">평가 지표:</h4>
              <div className="space-y-1">
                {models?.models.find(m => m.type === selectedModel)?.indicators.map(indicator => (
                  <Badge key={indicator} variant="outline" className="text-xs">
                    {indicator.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP 5 정류장 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            DRT 점수 상위 5개 정류장
          </CardTitle>
          <CardDescription>
            {selectedModel === 'commuter' ? '출퇴근 시간대 최적화 우선순위' :
             selectedModel === 'tourism' ? '관광 접근성 개선 우선순위' :
             '교통 형평성 개선 우선순위'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {districtData.top_stations.map((station, index) => (
              <div
                key={station.station_id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStation === station.station_id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedStation(station.station_id)}
              >
                <div className="text-center">
                  <Badge 
                    variant={getScoreBadgeVariant(station.drt_score)} 
                    className="mb-2"
                  >
                    #{index + 1}
                  </Badge>
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2" title={station.station_name}>
                    {station.station_name}
                  </h4>
                  <div className={`text-2xl font-bold ${getScoreColor(station.drt_score)}`}>
                    {station.drt_score.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    피크: {station.peak_hour}시
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 정류장 상세 분석 */}
      {stationDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 정류장 정보 및 점수 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {stationDetail.station.station_name}
              </CardTitle>
              <CardDescription>
                {stationDetail.station.district_name} · {stationDetail.station.administrative_dong}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 현재 점수 */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">현재 점수</p>
                    <p className={`text-xl font-bold ${getScoreColor(stationDetail.current_score)}`}>
                      {stationDetail.current_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">{stationDetail.current_hour}시</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">최고 점수</p>
                    <p className={`text-xl font-bold ${getScoreColor(stationDetail.peak_score)}`}>
                      {stationDetail.peak_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">{stationDetail.peak_hour}시</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">월 평균</p>
                    <p className={`text-xl font-bold ${getScoreColor(stationDetail.monthly_average)}`}>
                      {stationDetail.monthly_average.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* 세부 지표 점수 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">세부 지표 점수</h4>
                  <div className="space-y-2">
                    {Object.entries(stationDetail.feature_scores).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {key.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(value * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시간대별 점수 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                24시간 점수 패턴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {stationDetail.hourly_scores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground w-12">
                        {item.hour}시
                      </span>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.score >= 80 ? 'bg-green-500' :
                              item.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 전체 정류장 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            구 내 전체 정류장 DRT 점수
          </CardTitle>
          <CardDescription>
            총 {districtData.stations.length}개 정류장 (점수 높은 순)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {districtData.stations.slice(0, 20).map((station, index) => (
                <div
                  key={station.station_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedStation === station.station_id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/20'
                  }`}
                  onClick={() => setSelectedStation(station.station_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <h5 className="font-semibold text-sm">{station.station_name}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        피크 시간: {station.peak_hour}시
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(station.drt_score)}`}>
                        {station.drt_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {districtData.stations.length > 20 && (
                <div className="text-center pt-4">
                  <Badge variant="outline">
                    +{districtData.stations.length - 20}개 정류장 더 있음
                  </Badge>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}