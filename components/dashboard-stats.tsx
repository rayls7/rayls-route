"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Navigation, CheckCircle2, Clock } from "lucide-react"
import type { Route } from "@/lib/types"

interface DashboardStatsProps {
  route: Route | null
}

export function DashboardStats({ route }: DashboardStatsProps) {
  const totalVisits = route?.visits.length || 0
  const completedVisits = route?.visits.filter((v) => v.status === "completed").length || 0
  const inProgressVisits = route?.visits.filter((v) => v.status === "in-progress").length || 0
  const pendingVisits = route?.visits.filter((v) => v.status === "pending").length || 0

  const stats = [
    {
      label: "Total de Visitas",
      value: totalVisits,
      icon: MapPin,
      color: "text-primary",
    },
    {
      label: "Concluídas",
      value: completedVisits,
      icon: CheckCircle2,
      color: "text-chart-3",
    },
    {
      label: "Em Andamento",
      value: inProgressVisits,
      icon: Navigation,
      color: "text-accent",
    },
    {
      label: "Pendentes",
      value: pendingVisits,
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
