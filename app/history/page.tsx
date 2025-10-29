"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, FileDown, Search, SlidersHorizontal } from "lucide-react"
import { getRoutes } from "@/lib/storage"
import { generateRoutePDF } from "@/lib/pdf-generator"
import type { Route } from "@/lib/types"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HistoryPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "visits" | "km">("date")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setRoutes(getRoutes())
  }, [])

  // Filter and sort routes
  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((route) => {
        const dateStr = new Date(route.date).toLocaleDateString("pt-BR")
        const hasMatchingVisit = route.visits.some(
          (visit) => visit.addressName.toLowerCase().includes(query) || visit.address.toLowerCase().includes(query),
        )
        return dateStr.includes(query) || hasMatchingVisit
      })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "visits":
          return b.visits.length - a.visits.length
        case "km":
          return b.totalKm - a.totalKm
        default:
          return 0
      }
    })

    return sorted
  }, [routes, searchQuery, sortBy])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalRoutes: filteredAndSortedRoutes.length,
      totalVisits: filteredAndSortedRoutes.reduce((sum, r) => sum + r.visits.length, 0),
      totalKm: filteredAndSortedRoutes.reduce((sum, r) => sum + r.totalKm, 0),
    }
  }, [filteredAndSortedRoutes])

  const handleExportPDF = async (route: Route) => {
    try {
      setGeneratingPDF(route.id)
      await generateRoutePDF(route)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setGeneratingPDF(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Histórico de Rotas</h1>
              <p className="text-sm text-muted-foreground">Visualize e exporte suas rotas anteriores</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {routes.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma rota concluída</h3>
            <p className="text-muted-foreground">Complete suas primeiras rotas para vê-las aqui</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por data ou endereço..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {showFilters && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ordenar por:</span>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Data (mais recente)</SelectItem>
                        <SelectItem value="visits">Número de visitas</SelectItem>
                        <SelectItem value="km">Quilometragem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>

            {/* Statistics Summary */}
            {filteredAndSortedRoutes.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Rotas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalRoutes}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Visitas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalVisits}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Km Total</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalKm.toFixed(1)}</p>
                </Card>
              </div>
            )}

            {/* Routes List */}
            {filteredAndSortedRoutes.length === 0 ? (
              <Card className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma rota encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRoutes.map((route) => (
                  <Card key={route.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(route.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Visitas</p>
                            <p className="text-2xl font-bold text-foreground">{route.visits.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Quilometragem</p>
                            <p className="text-2xl font-bold text-foreground">{route.totalKm.toFixed(1)} km</p>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleExportPDF(route)} disabled={generatingPDF === route.id}>
                        <FileDown className="h-4 w-4 mr-2" />
                        {generatingPDF === route.id ? "Gerando..." : "Exportar PDF"}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {route.visits.map((visit, idx) => (
                        <div key={visit.id} className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{visit.addressName}</p>
                            <p className="text-muted-foreground text-xs">{visit.address}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {visit.startTime?.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {visit.endTime?.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs font-medium text-foreground">
                              {((visit.endKm || 0) - (visit.startKm || 0)).toFixed(1)} km
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
