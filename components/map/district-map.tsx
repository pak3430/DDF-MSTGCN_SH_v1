"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, Users } from "lucide-react"
import { apiService } from "@/lib/api"
import { extractDistrictBoundaries, getDistrictId } from "@/lib/geojson-utils"

// Leaflet CSS 임포트
import "leaflet/dist/leaflet.css"

// Leaflet 기본 아이콘 설정 (Next.js 호환성을 위해)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface DistrictMapProps {
  selectedDistrict?: string
  onDistrictSelect?: (district: string) => void
}

interface DistrictPopupData {
  district: string
  districtName: string
  totalPassengers: number
  peakHour: number
  stationCount: number
  loading: boolean
}

export function DistrictMap({ onDistrictSelect }: DistrictMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [popupData, setPopupData] = useState<DistrictPopupData | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [, setIsMapReady] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    
    // 이미 초기화된 경우 중복 초기화 방지
    if (mapInstanceRef.current) {
      console.log('Map already initialized, skipping...')
      return
    }

    // 기존 지도 컨테이너가 있다면 정리
    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
    if (container._leaflet_id) {
      console.log('Cleaning up existing map container...')
      delete container._leaflet_id
    }

    // DOM이 완전히 준비될 때까지 대기
    const initializeMap = async () => {
      try {
        // 약간의 지연으로 DOM 안정화 대기
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!mapRef.current || mapInstanceRef.current) return

        console.log('Initializing new map...')

        // 지도 초기화
        const map = L.map(mapRef.current, {
          center: [37.5665, 126.978], // 서울시청 좌표
          zoom: 11,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true
        })

        // CartoDB Positron 타일 레이어 추가
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map)

        mapInstanceRef.current = map
        setIsMapReady(true)

        // 지도가 완전히 로드된 후 GeoJSON 데이터 로드
        map.whenReady(() => {
          loadDistrictBoundaries(map)
        })

      } catch (error) {
        console.error('Map initialization error:', error)
        setMapError('지도 초기화 중 오류가 발생했습니다.')
        
        // 오류 발생 시 맵 키를 변경하여 다시 렌더링 시도
        setTimeout(() => {
          setMapKey(prev => prev + 1)
          setMapError(null)
        }, 1000)
      }
    }

    initializeMap()

    // 컴포넌트 언마운트 시 지도 정리
    return () => {
      if (mapInstanceRef.current) {
        try {
          console.log('Cleaning up map instance...')
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
        } catch (e) {
          console.warn('Map cleanup warning:', e)
        } finally {
          mapInstanceRef.current = null
          setIsMapReady(false)
        }
      }
      
      // DOM 컨테이너 정리
      if (mapRef.current && (mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        delete (mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id
      }
    }
  }, [])

  const loadDistrictBoundaries = useCallback(async (map: L.Map) => {
    try {
      // GeoJSON 파일 로드
      const response = await fetch('/reference/HangJeongDong_ver20250401.geojson')
      const geojsonData = await response.json()
      
      // 자치구 경계선 추출
      const districtBoundaries = extractDistrictBoundaries(geojsonData)
      
      // 자치구별 색상 배열 (다양한 색상으로 구분)
      const districtColors = [
        '#0891b2', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981',
        '#f97316', '#ec4899', '#06b6d4', '#84cc16', '#6366f1',
        '#f43f5e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444',
        '#10b981', '#f97316', '#ec4899', '#06b6d4', '#84cc16',
        '#6366f1', '#f43f5e', '#14b8a6', '#0891b2', '#f59e0b'
      ]
      
      // 지도에 자치구 영역 추가 (Polygon으로 - 채워진 영역)
      districtBoundaries.features.forEach((feature, index) => {
        const districtColor = districtColors[index % districtColors.length]
        // MultiPolygon을 Leaflet Polygon으로 변환
        const polygons: L.LatLng[][][] = []
        
        feature.geometry.coordinates.forEach(polygon => {
          const rings = (polygon as unknown as number[][][]).map(ring => 
            ring.map(coord => L.latLng(coord[1], coord[0]))
          )
          polygons.push(rings)
        })
        
        polygons.forEach(polygonRings => {
          const polygon = L.polygon(polygonRings, {
            color: districtColor,       // 경계선 색상 (자치구별 고유 색상)
            weight: 2,                  // 경계선 두께
            opacity: 0.9,               // 경계선 투명도
            fillColor: districtColor,   // 채우기 색상
            fillOpacity: 0.3,           // 채우기 투명도
            interactive: true
          })
          
          // 자치구 클릭 이벤트 핸들러
          polygon.on('click', () => {
            handleDistrictClick(feature.properties.sggnm)
          })
          
          // 호버 효과
          polygon.on('mouseover', (e) => {
            const layer = e.target
            layer.setStyle({
              weight: 3,
              opacity: 1,
              color: '#f59e0b',         // 호버 시 경계선 색상 (amber)
              fillColor: '#f59e0b',     // 호버 시 채우기 색상
              fillOpacity: 0.4          // 호버 시 채우기 투명도 증가
            })
            
            // 툴팁 표시
            layer.bindTooltip(feature.properties.sggnm, {
              permanent: false,
              direction: 'center',
              className: 'district-tooltip'
            }).openTooltip()
          })
          
          polygon.on('mouseout', (e) => {
            const layer = e.target
            layer.setStyle({
              weight: 2,
              opacity: 0.9,
              color: districtColor,
              fillColor: districtColor,
              fillOpacity: 0.3
            })
            layer.closeTooltip()
          })
          
          polygon.addTo(map)
        })
      })
      
    } catch (error) {
      console.error('Failed to load district boundaries:', error)
      setMapError('자치구 경계선 로드 중 오류가 발생했습니다.')
    }
  }, [])

  const handleDistrictClick = async (districtName: string) => {
    const districtId = getDistrictId(districtName)
    
    setPopupData({
      district: districtId,
      districtName: districtName,
      totalPassengers: 0,
      peakHour: 0,
      stationCount: 0,
      loading: true
    })

    try {
      // API 호출하여 해당 구의 교통 데이터 조회
      const trafficData = await apiService.getTrafficPatterns(districtId, '2025-07')
      
      setPopupData({
        district: districtId,
        districtName: districtName,
        totalPassengers: trafficData.total_weekday_passengers + trafficData.total_weekend_passengers,
        peakHour: trafficData.peak_hours.weekday_morning_peak.hour,
        stationCount: 100, // 임시 고정값 (실제 API 연동 시 변경)
        loading: false
      })
      
      // 부모 컴포넌트에 선택된 자치구 알림
      onDistrictSelect?.(districtId)
      
    } catch (error) {
      console.error('Failed to fetch district data:', error)
      // API 실패 시 Mock 데이터로 표시
      setPopupData(prev => prev ? {
        ...prev,
        totalPassengers: 95234,
        peakHour: 8,
        stationCount: 150,
        loading: false
      } : null)
    }
  }

  const closePopup = () => {
    setPopupData(null)
  }

  if (mapError) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-destructive">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>{mapError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      <div 
        key={mapKey} 
        ref={mapRef} 
        className="h-96 w-full rounded-lg overflow-hidden bg-muted" 
      />
      
      {/* 자치구 상세 정보 팝업 */}
      {popupData && (
        <Card className="absolute top-4 right-4 w-80 shadow-lg border-primary/20 z-[1000]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {popupData.districtName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closePopup} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {popupData.loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">총 교통량</span>
                  <Badge variant="secondary">
                    {popupData.totalPassengers.toLocaleString()}만명
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">피크 시간</span>
                  <Badge variant="outline">
                    오전 {popupData.peakHour}시
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    정류장 수
                  </span>
                  <Badge variant="secondary">
                    {popupData.stationCount}개
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onDistrictSelect?.(popupData.district)}
                  >
                    상세 분석 보기
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}