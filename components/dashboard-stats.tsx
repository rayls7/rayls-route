"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Navigation, CheckCircle2, Clock } from "lucide-react"
import type { Route, Address } from "@/lib/types"

interface DashboardStatsProps {
  route: Route | null
  addresses: Address[]
}

export function DashboardStats({ route, addresses }: DashboardStatsProps) {
  const hasActiveRoute = route !== null

  let totalCount = 0
  let completedCount = 0
  let inProgressCount = 0
  let pendingCount = 0

  if (hasActiveRoute) {
    // When there's an active route, count visits
    totalCount = route.visits.length
    completedCount = route.visits.filter((v) => v.status === "completed").length
    inProgressCount = route.visits.filter((v) => v.status === "in-progress").length
    pendingCount = route.visits.filter((v) => v.status === "pending").length
  } else {
    // When there's no route, count addresses
    totalCount = addresses.length
    completedCount = 0
    inProgressCount = 0
    pendingCount = addresses.length
  }

  const stats = [
    {
      label: hasActiveRoute ? "Total de Visitas" : "Total de Endereços",
      value: totalCount,
      icon: MapPin,
      color: "text-primary",
    },
    {
      label: "Concluídas",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-chart-3",
    },
    {
      label: "Em Andamento",
      value: inProgressCount,
      icon: Navigation,
      color: "text-accent",
    },
    {
      label: "Pendentes",
      value: pendingCount,
      icon: Clock,
      color: "text-muted-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  )
}
