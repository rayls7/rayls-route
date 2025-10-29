"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, CheckCircle2, NavigationIcon, Camera, Locate } from "lucide-react"
import { getCurrentRoute, updateVisit, updateCurrentRoute, completeRoute } from "@/lib/storage"
import type { Route, Visit } from "@/lib/types"
import Link from "next/link"
import { getCurrentPosition } from "@/lib/geolocation"
import { CameraCapture } from "@/components/camera-capture"

export default function RoutePage() {
  const [route, setRoute] = useState<Route | null>(null)
  const [currentVisitIndex, setCurrentVisitIndex] = useState(0)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraMode, setCameraMode] = useState<"start" | "end">("start")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    const loadedRoute = getCurrentRoute()
    if (loadedRoute) {
      setRoute(loadedRoute)
      const firstPending = loadedRoute.visits.findIndex((v) => v.status !== "completed")
      if (firstPending !== -1) {
        setCurrentVisitIndex(firstPending)
      }
    }

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("[v0] Error watching location:", error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        },
      )
      setWatchId(id)
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  const currentVisit = route?.visits[currentVisitIndex]

  const handleNavigate = () => {
    if (!currentVisit) return

    const address = encodeURIComponent(currentVisit.address)

    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      // Open Apple Maps
      window.open(`maps://maps.apple.com/?q=${address}`, "_blank")
    } else {
      // Open Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank")
    }
  }

  const handleArrived = () => {
    setCameraMode("start")
    setCameraOpen(true)
  }

  const handleStartPhotoCapture = async (photoDataUrl: string) => {
    if (!route || !currentVisit) return

    try {
      const position = await getCurrentPosition()
      const startKm = prompt("Digite a quilometragem atual:")
      if (!startKm) return

      const updatedVisit: Partial<Visit> = {
        status: "in-progress",
        startTime: new Date(),
        startKm: Number.parseFloat(startKm),
        startLat: position.latitude,
        startLng: position.longitude,
        startPhoto: photoDataUrl,
      }

      updateVisit(route.id, currentVisit.id, updatedVisit)

      const updatedRoute = getCurrentRoute()
      if (updatedRoute) {
        updatedRoute.status = "in-progress"
        updateCurrentRoute(updatedRoute)
        setRoute(updatedRoute)
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error)
      alert("Não foi possível obter a localização. Verifique as permissões.")
    }
  }

  const handleComplete = () => {
    setCameraMode("end")
    setCameraOpen(true)
  }

  const handleEndPhotoCapture = async (photoDataUrl: string) => {
    if (!route || !currentVisit) return

    try {
      const position = await getCurrentPosition()
      const endKm = prompt("Digite a quilometragem atual:")
      if (!endKm) return

      const updatedVisit: Partial<Visit> = {
        status: "completed",
        endTime: new Date(),
        endKm: Number.parseFloat(endKm),
        endLat: position.latitude,
        endLng: position.longitude,
        endPhoto: photoDataUrl,
      }

      updateVisit(route.id, currentVisit.id, updatedVisit)

      const updatedRoute = getCurrentRoute()
      if (updatedRoute) {
        const allCompleted = updatedRoute.visits.every((v) => v.status === "completed")
        if (allCompleted) {
          updatedRoute.status = "completed"
          const totalKm = updatedRoute.visits.reduce((sum, v) => {
            return sum + ((v.endKm || 0) - (v.startKm || 0))
          }, 0)
          updatedRoute.totalKm = totalKm
          completeRoute(updatedRoute)
          alert("Rota concluída! Você pode gerar o PDF no histórico.")
          window.location.href = "/"
        } else {
          updateCurrentRoute(updatedRoute)
          setRoute(updatedRoute)
          setCurrentVisitIndex(currentVisitIndex + 1)
        }
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error)
      alert("Não foi possível obter a localização. Verifique as permissões.")
    }
  }

  const handleNext = () => {
    if (currentVisitIndex < (route?.visits.length || 0) - 1) {
      setCurrentVisitIndex(currentVisitIndex + 1)
    }
  }

  if (!route || !currentVisit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma rota ativa</p>
          <Button className="mt-4" asChild>
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const completedCount = route.visits.filter((v) => v.status === "completed").length
  const progress = (completedCount / route.visits.length) * 100

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
              <h1 className="text-xl font-bold text-foreground">Rota em Andamento</h1>
              <p className="text-sm text-muted-foreground">
                {completedCount} de {route.visits.length} visitas concluídas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-secondary rounded-lg p-2">
            <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {currentLocation && (
            <Card className="p-4 bg-chart-1/10 border-chart-1">
              <div className="flex items-center gap-3">
                <Locate className="h-5 w-5 text-chart-1 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-foreground">Localização Atual</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto bg-chart-1/20 text-chart-1 border-chart-1">
                  Rastreando
                </Badge>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {currentVisitIndex + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentVisit.addressName}</h2>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>{currentVisit.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full bg-transparent" variant="outline" onClick={handleNavigate}>
                <NavigationIcon className="h-5 w-5 mr-2" />
                Abrir GPS / Navegar
              </Button>

              {currentVisit.status === "pending" && (
                <Button size="lg" className="w-full" onClick={handleArrived}>
                  <Camera className="h-5 w-5 mr-2" />
                  Cheguei no Local
                </Button>
              )}

              {currentVisit.status === "in-progress" && (
                <>
                  <div className="bg-accent/10 border border-accent rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Visita iniciada às</p>
                    <p className="text-lg font-semibold text-foreground">
                      {currentVisit.startTime?.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {currentVisit.startPhoto && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Foto Inicial do Motor</p>
                      <img
                        src={currentVisit.startPhoto || "/placeholder.svg"}
                        alt="Foto inicial"
                        className="w-full rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <Button size="lg" className="w-full" onClick={handleComplete}>
                    <Camera className="h-5 w-5 mr-2" />
                    Concluir Visita
                  </Button>
                </>
              )}

              {currentVisit.status === "completed" && (
                <>
                  <div className="bg-chart-3/10 border border-chart-3 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-chart-3 mb-2" />
                    <p className="font-semibold text-foreground">Visita Concluída</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {currentVisit.startPhoto && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Foto Inicial</p>
                        <img
                          src={currentVisit.startPhoto || "/placeholder.svg"}
                          alt="Foto inicial"
                          className="w-full rounded-lg border border-border"
                        />
                      </div>
                    )}
                    {currentVisit.endPhoto && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Foto Final</p>
                        <img
                          src={currentVisit.endPhoto || "/placeholder.svg"}
                          alt="Foto final"
                          className="w-full rounded-lg border border-border"
                        />
                      </div>
                    )}
                  </div>

                  {currentVisitIndex < route.visits.length - 1 && (
                    <Button size="lg" className="w-full" onClick={handleNext}>
                      Próxima Visita
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {route.visits.length > 1 && (
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Próximas Visitas</h3>
              <div className="space-y-3">
                {route.visits.slice(currentVisitIndex + 1, currentVisitIndex + 4).map((visit, idx) => (
                  <div key={visit.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium">
                      {currentVisitIndex + idx + 2}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{visit.addressName}</p>
                      <p className="text-muted-foreground text-xs truncate">{visit.address}</p>
                    </div>
                    {visit.status === "completed" && <CheckCircle2 className="h-5 w-5 text-chart-3" />}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={cameraMode === "start" ? handleStartPhotoCapture : handleEndPhotoCapture}
        title={cameraMode === "start" ? "Foto Inicial do Motor" : "Foto Final do Motor"}
      />
    </div>
  )
}
