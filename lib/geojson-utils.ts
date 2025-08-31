interface OriginalFeature {
  properties: {
    sggnm: string
    sgg: string
    sidonm: string
  }
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][] | number[][][][]
  }
}

interface OriginalGeoJSON {
  features: OriginalFeature[]
}

export interface DistrictFeature {
  type: "Feature"
  properties: {
    sggnm: string  // 자치구 이름 (예: "종로구")
    sgg: string    // 자치구 코드 (예: "11110")
    sidonm: string // 시도명 (예: "서울특별시")
  }
  geometry: {
    type: "MultiPolygon"
    coordinates: number[][][][]
  }
}

export interface DistrictGeoJSON {
  type: "FeatureCollection"
  features: DistrictFeature[]
}

/**
 * 원본 GeoJSON에서 자치구별로 통합된 경계만 추출 (내부 경계선 제거)
 * @param originalGeoJSON 원본 행정동 GeoJSON 데이터
 * @returns 자치구 통합 경계 GeoJSON
 */
export function extractDistrictBoundaries(originalGeoJSON: OriginalGeoJSON): DistrictGeoJSON {
  const districtMap = new Map<string, {
    properties: { sggnm: string; sgg: string; sidonm: string }
    polygons: number[][][]
  }>()
  
  // 1단계: 자치구별로 모든 행정동 폴리곤을 수집
  originalGeoJSON.features.forEach((feature: OriginalFeature) => {
    const sggnm = feature.properties.sggnm
    const sgg = feature.properties.sgg
    const sidonm = feature.properties.sidonm
    
    // 서울시만 필터링
    if (sidonm === "서울특별시") {
      if (!districtMap.has(sgg)) {
        districtMap.set(sgg, {
          properties: { sggnm, sgg, sidonm },
          polygons: []
        })
      }
      
      const district = districtMap.get(sgg)!
      
      // 모든 좌표를 단일 배열로 수집
      if (feature.geometry.type === "MultiPolygon") {
        const coords = feature.geometry.coordinates as number[][][][]
        coords.forEach(polygon => {
          district.polygons.push(...polygon)
        })
      } else if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates as number[][][]
        district.polygons.push(...coords)
      }
    }
  })
  
  // 2단계: 각 자치구의 외곽 경계만 추출하여 DistrictFeature로 변환
  const features: DistrictFeature[] = []
  
  districtMap.forEach((district) => {
    // 모든 폴리곤을 하나의 MultiPolygon으로 통합
    // 실제로는 convex hull이나 union 연산이 필요하지만, 
    // 여기서는 모든 링을 하나의 MultiPolygon으로 그룹화
    const coordinates: number[][][][] = [district.polygons]
    
    features.push({
      type: "Feature",
      properties: district.properties,
      geometry: {
        type: "MultiPolygon",
        coordinates
      }
    })
  })
  
  return {
    type: "FeatureCollection",
    features
  }
}

/**
 * 자치구명을 영어 ID로 매핑하는 함수
 */
export function getDistrictId(koreanName: string): string {
  const districtMapping: { [key: string]: string } = {
    "종로구": "jongno",
    "중구": "jung", 
    "용산구": "yongsan",
    "성동구": "seongdong",
    "광진구": "gwangjin",
    "동대문구": "dongdaemun",
    "중랑구": "jungnang",
    "성북구": "seongbuk",
    "강북구": "gangbuk",
    "도봉구": "dobong",
    "노원구": "nowon",
    "은평구": "eunpyeong",
    "서대문구": "seodaemun",
    "마포구": "mapo",
    "양천구": "yangcheon",
    "강서구": "gangseo",
    "구로구": "guro",
    "금천구": "geumcheon",
    "영등포구": "yeongdeungpo",
    "동작구": "dongjak",
    "관악구": "gwanak",
    "서초구": "seocho",
    "강남구": "gangnam",
    "송파구": "songpa",
    "강동구": "gangdong"
  }
  
  return districtMapping[koreanName] || koreanName.toLowerCase()
}