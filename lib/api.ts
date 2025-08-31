const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ==========================================
// 1. Traffic API Interfaces
// ==========================================
export interface TrafficPatternData {
  hour: number
  avg_ride_passengers: number
  avg_alight_passengers: number
  avg_total_passengers: number
}

export interface PeakHourData {
  hour: number
  avg_total_passengers: number
}

export interface HourlyTrafficData {
  analysis_month: string
  region_type: string
  region_name: string
  district_name?: string
  weekday_patterns: TrafficPatternData[]
  weekend_patterns: TrafficPatternData[]
  peak_hours: {
    weekday_morning_peak: PeakHourData
    weekday_evening_peak: PeakHourData
    weekend_peak: PeakHourData
  }
  total_weekday_passengers: number
  total_weekend_passengers: number
  weekday_weekend_ratio: number
}

// ==========================================
// 2. Heatmap API Interfaces
// ==========================================
export interface CoordinateData {
  lat: number
  lng: number
}

export interface BoundaryData {
  coordinates: CoordinateData[][]
}

export interface StationTrafficData {
  station_id: string
  station_name: string
  coordinate: CoordinateData
  total_traffic: number
  total_ride: number
  total_alight: number
  daily_average: number
}

export interface DistrictTrafficData {
  district_code: string
  district_name: string
  boundary: BoundaryData
  total_traffic: number
  total_ride: number
  total_alight: number
  daily_average: number
  station_count: number
  stations: StationTrafficData[]
  traffic_rank: number
  traffic_density: number
}

export interface HeatmapStatistics {
  max_district_traffic: number
  min_district_traffic: number
  max_station_traffic: number
  min_station_traffic: number
  total_seoul_traffic: number
  total_stations: number
  district_traffic_quartiles: number[]
  station_traffic_quartiles: number[]
}

export interface SeoulHeatmapData {
  analysis_month: string
  seoul_boundary: BoundaryData
  districts: DistrictTrafficData[]
  statistics: HeatmapStatistics
  data_period: string
  last_updated: string
}

// 기존 인터페이스 호환성 유지
export interface TopDistrict {
  district_name: string
  total_traffic: number
  rank: number
  traffic_density: number
  station_count: number
}

export interface TopStation {
  station_name: string
  total_traffic: number
  daily_average: number
  district: string
}

export interface HeatmapData {
  top_districts: TopDistrict[]
  top_stations: TopStation[]
}

// ==========================================
// 3. Anomaly Pattern API Interfaces
// ==========================================
export interface StationInfo {
  station_id: string
  station_name: string
  latitude: number
  longitude: number
  district_name: string
  administrative_dong: string
}

export interface WeekendDominantStation {
  station: StationInfo
  weekend_total_traffic: number
  weekend_peak_hours: number[]
  weekend_peak_traffic: number[]
  rank: number
  vs_district_avg: number
}

export interface NightDemandStation {
  station: StationInfo
  total_night_ride: number
  night_hours_traffic: number[]
  vs_district_avg: number
}

export interface RushHourStation {
  morning_rush: Array<{
    station: StationInfo
    total_morning_rush: number
    morning_hours_traffic: number[]
    vs_district_avg: number
  }>
  evening_rush: Array<{
    station: StationInfo
    total_evening_rush: number
    evening_hours_traffic: number[]
    vs_district_avg: number
  }>
}

export interface LunchTimeStation {
  station: StationInfo
  total_lunch_alight: number
  lunch_hours_alight: number[]
  vs_district_avg: number
}

export interface ResidentialAreaStation {
  station: StationInfo
  morning_ride: number
  morning_alight: number
  evening_ride: number
  evening_alight: number
  total_traffic: number
  imbalance_ratio: number
}

export interface BusinessAreaStation {
  station: StationInfo
  morning_ride: number
  morning_alight: number
  evening_ride: number
  evening_alight: number
  total_traffic: number
  imbalance_ratio: number
}

export interface AreaTypeAnalysis {
  residential_stations: ResidentialAreaStation[]
  business_stations: BusinessAreaStation[]
}

export interface UnderutilizedStation {
  station: StationInfo
  avg_daily_passengers: number
  max_daily_passengers: number
  connecting_routes: number
  utilization_rate: number
  efficiency_score: number
}

export interface IntegratedAnomalyPatterns {
  district_name: string
  analysis_month: string
  generated_at: string
  weekend_dominant_stations: WeekendDominantStation[]
  night_demand_stations: NightDemandStation[]
  rush_hour_stations: RushHourStation
  lunch_time_stations: LunchTimeStation[]
  area_type_analysis: AreaTypeAnalysis
  underutilized_stations: UnderutilizedStation[]
}

// 기존 인터페이스 호환성 유지
export interface AnomalyPattern {
  pattern_id: number
  station_name: string
  district: string
  anomaly_score: number
  pattern_description: string
  detected_at: string
  severity: 'high' | 'medium' | 'low'
}

// ==========================================
// 4. DRT Score API Interfaces  
// ==========================================
export interface StationDRTScoreSummary {
  station_id: string
  station_name: string
  coordinate: CoordinateData
  drt_score: number
  peak_hour: number
}

export interface DistrictDRTScoreData {
  district_name: string
  model_type: string
  analysis_month: string
  stations: StationDRTScoreSummary[]
  top_stations: StationDRTScoreSummary[]
}

export interface StationDRTDetail {
  station: StationInfo
  model_type: string
  analysis_month: string
  current_hour: number
  current_score: number
  peak_score: number
  peak_hour: number
  monthly_average: number
  feature_scores: Record<string, number>
  hourly_scores: Array<{ hour: number; score: number }>
}

export interface DRTModelInfo {
  type: string
  name: string
  description: string
  indicators: string[]
  peak_hours?: number[]
  weighted_hours?: number[]
  vulnerable_hours?: number[]
  feature_descriptions: Record<string, string>
}

export interface DRTModelsResponse {
  models: DRTModelInfo[]
}

// 기존 인터페이스 호환성 유지
export interface DRTScore {
  station_id: string
  station_name: string
  district: string
  drt_score: number
  demand_score: number
  accessibility_score: number
  efficiency_score: number
  recommendation: string
}

// ==========================================
// 5. API Response Wrapper Interface
// ==========================================
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
  execution_time?: number
}

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  // ==========================================
  // Traffic API Methods
  // ==========================================
  async getTrafficPatterns(district?: string, month?: string): Promise<HourlyTrafficData> {
    const params = new URLSearchParams()
    
    // API 요구사항에 맞게 파라미터 설정
    if (month) {
      // month가 "2025-07" 형식이면 "-01" 추가
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    if (district && district !== 'seoul') {
      params.append('region_type', 'district')
      // 한글 구 이름으로 매핑
      const districtMap: { [key: string]: string } = {
        'gangnam': '강남구',
        'gangbuk': '강북구', 
        'mapo': '마포구',
        'seocho': '서초구',
        'songpa': '송파구',
        'yeongdeungpo': '영등포구',
        'jung': '중구',
        'jongno': '종로구',
        'dongjak': '동작구'
      }
      params.append('district_name', districtMap[district] || district)
    } else {
      params.append('region_type', 'seoul')
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/traffic/hourly?${queryString}`
    
    return this.fetchApi<HourlyTrafficData>(endpoint)
  }

  // ==========================================
  // Heatmap API Methods
  // ==========================================
  async getSeoulHeatmap(month?: string, includeStationDetails: boolean = true, minTrafficThreshold?: number): Promise<SeoulHeatmapData> {
    const params = new URLSearchParams()
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('include_station_details', includeStationDetails.toString())
    
    if (minTrafficThreshold) {
      params.append('min_traffic_threshold', minTrafficThreshold.toString())
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/heatmap/seoul?${queryString}`
    
    return this.fetchApi<SeoulHeatmapData>(endpoint)
  }

  async getDistrictHeatmap(districtName: string, month?: string, minTrafficThreshold?: number): Promise<DistrictTrafficData> {
    const params = new URLSearchParams()
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    if (minTrafficThreshold) {
      params.append('min_traffic_threshold', minTrafficThreshold.toString())
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/heatmap/districts/${encodeURIComponent(districtName)}?${queryString}`
    
    return this.fetchApi<DistrictTrafficData>(endpoint)
  }

  async getHeatmapStatistics(month?: string): Promise<ApiResponse<{ statistics: HeatmapStatistics; processing_time_ms: number }>> {
    const params = new URLSearchParams()
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/heatmap/statistics?${queryString}`
    
    return this.fetchApi<ApiResponse<{ statistics: HeatmapStatistics; processing_time_ms: number }>>(endpoint)
  }

  // 기존 호환성 유지 메서드
  async getHeatmapData(district?: string, month?: string): Promise<HeatmapData> {
    try {
      const seoulData = await this.getSeoulHeatmap(month, true)
      
      // 백엔드 응답을 프론트엔드 인터페이스에 맞게 변환
      const topDistricts: TopDistrict[] = seoulData.districts?.slice(0, 5).map((item: DistrictTrafficData, index: number) => ({
        district_name: item.district_name,
        total_traffic: item.total_traffic,
        rank: index + 1,
        traffic_density: item.traffic_density || 0,
        station_count: item.station_count
      })) || []
      
      // 상위 5개 정류장 추출
      const allStations = seoulData.districts.flatMap(d => d.stations)
        .sort((a, b) => b.total_traffic - a.total_traffic)
        .slice(0, 5)
      
      const topStations: TopStation[] = allStations.map(station => ({
        station_name: station.station_name,
        total_traffic: station.total_traffic,
        daily_average: station.daily_average,
        district: seoulData.districts.find(d => d.stations.includes(station))?.district_name || ''
      }))
      
      return {
        top_districts: topDistricts,
        top_stations: topStations
      }
    } catch (error) {
      // API 실패 시 Mock 데이터로 fallback
      console.warn('Heatmap API failed, using mock data:', error)
      return {
        top_districts: [
          { district_name: "강남구", total_traffic: 10374028, rank: 1, traffic_density: 10541.5, station_count: 984 },
          { district_name: "서초구", total_traffic: 8234567, rank: 2, traffic_density: 8234.2, station_count: 756 },
          { district_name: "송파구", total_traffic: 7456789, rank: 3, traffic_density: 7123.4, station_count: 689 },
          { district_name: "영등포구", total_traffic: 6789012, rank: 4, traffic_density: 6456.8, station_count: 612 },
          { district_name: "마포구", total_traffic: 5678901, rank: 5, traffic_density: 5234.1, station_count: 534 },
        ],
        top_stations: [
          { station_name: "지하철2호선강남역", total_traffic: 125847, daily_average: 4059.26, district: "강남구" },
          { station_name: "지하철2호선서초역", total_traffic: 98234, daily_average: 3169.48, district: "서초구" },
          { station_name: "지하철9호선고속터미널역", total_traffic: 87456, daily_average: 2821.16, district: "서초구" },
          { station_name: "지하철1호선서울역", total_traffic: 76543, daily_average: 2469.77, district: "중구" },
          { station_name: "지하철4호선사당역", total_traffic: 65432, daily_average: 2110.71, district: "동작구" },
        ]
      }
    }
  }

  // ==========================================
  // Anomaly Pattern API Methods
  // ==========================================
  async getIntegratedAnomalyPatterns(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<IntegratedAnomalyPatterns>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/integration?${queryString}`
    
    return this.fetchApi<ApiResponse<IntegratedAnomalyPatterns>>(endpoint)
  }

  async getWeekendDominantStations(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<WeekendDominantStation[]>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/weekend-dominant?${queryString}`
    
    return this.fetchApi<ApiResponse<WeekendDominantStation[]>>(endpoint)
  }

  async getNightDemandStations(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<NightDemandStation[]>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/night-demand?${queryString}`
    
    return this.fetchApi<ApiResponse<NightDemandStation[]>>(endpoint)
  }

  async getRushHourStations(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<RushHourStation>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/rush-hour?${queryString}`
    
    return this.fetchApi<ApiResponse<RushHourStation>>(endpoint)
  }

  async getLunchTimeStations(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<LunchTimeStation[]>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/lunch-time?${queryString}`
    
    return this.fetchApi<ApiResponse<LunchTimeStation[]>>(endpoint)
  }

  async getAreaTypeAnalysis(districtName: string, month?: string, topN: number = 5): Promise<ApiResponse<AreaTypeAnalysis>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/area-type?${queryString}`
    
    return this.fetchApi<ApiResponse<AreaTypeAnalysis>>(endpoint)
  }

  async getUnderutilizedStations(districtName: string, month?: string, topN: number = 10): Promise<ApiResponse<UnderutilizedStation[]>> {
    const params = new URLSearchParams()
    
    params.append('district_name', districtName)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    params.append('top_n', topN.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/v1/anomaly-pattern/underutilized?${queryString}`
    
    return this.fetchApi<ApiResponse<UnderutilizedStation[]>>(endpoint)
  }

  // 기존 호환성 유지 메서드
  async getAnomalyPatterns(district?: string, month?: string): Promise<AnomalyPattern[]> {
    try {
      if (!district || district === 'seoul') {
        // 서울 전체인 경우 강남구로 대체 (예시)
        district = '강남구'
      }
      
      const response = await this.getIntegratedAnomalyPatterns(district, month)
      
      // 통합 데이터를 기존 형식으로 변환
      const patterns: AnomalyPattern[] = []
      const data = response.data
      
      // 주말 우세 패턴
      data.weekend_dominant_stations.forEach((station, index) => {
        patterns.push({
          pattern_id: index + 1,
          station_name: station.station.station_name,
          district: station.station.district_name,
          anomaly_score: station.weekend_total_traffic,
          pattern_description: '주말 고수요 정류장',
          detected_at: data.generated_at,
          severity: index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
        })
      })
      
      return patterns
    } catch (error) {
      console.warn('Anomaly patterns API failed:', error)
      return []
    }
  }

  // ==========================================
  // DRT Score API Methods
  // ==========================================
  async getDistrictDRTScores(districtName: string, modelType: 'commuter' | 'tourism' | 'vulnerable', month?: string): Promise<DistrictDRTScoreData> {
    const params = new URLSearchParams()
    
    params.append('model_type', modelType)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/drt-score/districts/${encodeURIComponent(districtName)}?${queryString}`
    
    return this.fetchApi<DistrictDRTScoreData>(endpoint)
  }

  async getStationDRTDetail(stationId: string, modelType: 'commuter' | 'tourism' | 'vulnerable', month?: string, hour?: number): Promise<StationDRTDetail> {
    const params = new URLSearchParams()
    
    params.append('model_type', modelType)
    
    if (month) {
      const analysisMonth = month.includes('-01') ? month : `${month}-01`
      params.append('analysis_month', analysisMonth)
    } else {
      params.append('analysis_month', '2025-07-01')
    }
    
    if (hour !== undefined) {
      params.append('hour', hour.toString())
    }
    
    const queryString = params.toString()
    const endpoint = `/api/v1/drt-score/stations/${encodeURIComponent(stationId)}?${queryString}`
    
    return this.fetchApi<StationDRTDetail>(endpoint)
  }

  async getDRTModels(): Promise<DRTModelsResponse> {
    const endpoint = `/api/v1/drt-score/models`
    
    return this.fetchApi<DRTModelsResponse>(endpoint)
  }

  // 기존 호환성 유지 메서드
  async getDRTScores(district?: string, month?: string): Promise<DRTScore[]> {
    try {
      if (!district || district === 'seoul') {
        // 서울 전체인 경우 강남구로 대체 (예시)
        district = '강남구'
      }
      
      const response = await this.getDistrictDRTScores(district, 'commuter', month)
      
      // 새 형식을 기존 형식으로 변환
      const drtScores: DRTScore[] = response.top_stations.map(station => ({
        station_id: station.station_id,
        station_name: station.station_name,
        district: response.district_name,
        drt_score: station.drt_score,
        demand_score: station.drt_score * 0.3,
        accessibility_score: station.drt_score * 0.3,
        efficiency_score: station.drt_score * 0.4,
        recommendation: station.drt_score > 80 ? '높은 DRT 우선순위' : 
                       station.drt_score > 60 ? '중간 DRT 우선순위' : '낮은 DRT 우선순위'
      }))
      
      return drtScores
    } catch (error) {
      console.warn('DRT scores API failed:', error)
      return []
    }
  }

  // ==========================================
  // Dashboard Summary (기존 유지)
  // ==========================================
  async getDashboardSummary(district?: string, month?: string) {
    // 트래픽 데이터를 기반으로 대시보드 요약 정보 생성
    const trafficData = await this.getTrafficPatterns(district, month)
    
    return {
      total_passengers: trafficData.total_weekday_passengers + trafficData.total_weekend_passengers,
      daily_average: Math.round((trafficData.total_weekday_passengers + trafficData.total_weekend_passengers) / 30),
      peak_hour_traffic: trafficData.peak_hours.weekday_morning_peak.avg_total_passengers,
      active_stations: 20590, // 고정값 (실제 데이터에서 가져올 수 있음)
      weekday_weekend_ratio: trafficData.weekday_weekend_ratio,
      top_district: trafficData.district_name || "서울시 전체",
    }
  }

  // ==========================================
  // Health Check Methods
  // ==========================================
  async getTrafficHealthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.fetchApi<ApiResponse<Record<string, unknown>>>('/api/v1/traffic/hourly/health')
  }

  async getHeatmapHealthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.fetchApi<ApiResponse<Record<string, unknown>>>('/api/v1/heatmap/health')
  }

  async getAnomalyPatternHealthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.fetchApi<ApiResponse<Record<string, unknown>>>('/api/v1/anomaly-pattern/health')
  }

  async getDRTScoreHealthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.fetchApi<ApiResponse<Record<string, unknown>>>('/api/v1/drt-score/health')
  }
}

export const apiService = new ApiService()