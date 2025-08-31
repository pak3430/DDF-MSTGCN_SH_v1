"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface DistrictMapWrapperProps {
  selectedDistrict?: string
  onDistrictSelect?: (district: string) => void
}

// Leaflet 컴포넌트를 동적으로 로드 (SSR 방지)
const DynamicDistrictMap = dynamic(
  () => import('./district-map').then((mod) => ({ default: mod.DistrictMap })),
  {
    ssr: false,
    loading: () => (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-primary animate-pulse" />
            <p className="text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    ),
  }
)

export function DistrictMapWrapper({ selectedDistrict, onDistrictSelect }: DistrictMapWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-primary animate-pulse" />
            <p className="text-muted-foreground">지도를 준비 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DynamicDistrictMap 
      selectedDistrict={selectedDistrict}
      onDistrictSelect={onDistrictSelect}
    />
  )
}