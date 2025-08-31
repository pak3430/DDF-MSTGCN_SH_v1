"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  Map,
  AlertTriangle,
  Clock,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Database,
  Bell,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    { id: "overview", label: "대시보드 개요", icon: Home },
    { id: "traffic", label: "교통 패턴", icon: Clock },
    { id: "heatmap", label: "히트맵", icon: Map },
    { id: "anomaly", label: "특이 패턴", icon: AlertTriangle },
    { id: "drt-score", label: "DRT 점수", icon: BarChart3 },
  ]

  const systemItems = [
    { id: "data", label: "데이터 관리", icon: Database },
    { id: "alerts", label: "알림", icon: Bell },
    { id: "settings", label: "설정", icon: Settings },
    { id: "help", label: "도움말", icon: HelpCircle },
  ]

  return (
    <div
      className={`bg-card border-r border-border transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} flex flex-col h-full`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">DRT Analytics</h2>
                <Badge variant="secondary" className="text-xs">
                  Seoul Transport
                </Badge>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isCollapsed ? "px-2" : "px-3"} ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Button>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {!isCollapsed && <p className="text-xs font-medium text-muted-foreground px-3 mb-2">시스템</p>}
          {systemItems.map((item) => {
            const Icon = item.icon

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start gap-3 ${isCollapsed ? "px-2" : "px-3"} text-muted-foreground hover:text-foreground`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>Last updated: 2025-07-31</p>
            <p>Data source: Seoul Transport</p>
          </div>
        </div>
      )}
    </div>
  )
}
