"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Navigation, History } from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"
import { AddressList } from "@/components/address-list"
import { AddAddressDialog } from "@/components/add-address-dialog"
import { StartingPointDialog } from "@/components/starting-point-dialog"
import { RoutePreviewDialog } from "@/components/route-preview-dialog"
import { InstallPrompt } from "@/components/install-prompt"
import { getAddresses, getCurrentRoute, createRoute } from "@/lib/storage"
import type { Address, Route } from "@/lib/types"
import Link from "next/link"

export default function HomePage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAddress, setEditAddress] = useState<Address | null>(null)
  const [startingPointOpen, setStartingPointOpen] = useState(false)
  const [routePreviewOpen, setRoutePreviewOpen] = useState(false)
  const [tempStartingPoint, setTempStartingPoint] = useState<{
    point: string
    lat?: number
    lng?: number
  } | null>(null)

  const loadData = () => {
    setAddresses(getAddresses())
    setCurrentRoute(getCurrentRoute())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStartRoute = () => {
    if (addresses.length === 0) {
      alert("Adicione endereços antes de iniciar uma rota")
      return
    }
    setStartingPointOpen(true)
  }

  const handleStartingPointConfirm = (startingPoint: string, lat?: number, lng?: number) => {
    setTempStartingPoint({ point: startingPoint, lat, lng })
    setStartingPointOpen(false)
    setRoutePreviewOpen(true)
  }

  const handleRouteConfirm = () => {
    if (tempStartingPoint) {
      const route = createRoute(addresses, tempStartingPoint.point, tempStartingPoint.lat, tempStartingPoint.lng)
      setCurrentRoute(route)
      setRoutePreviewOpen(false)
      setTempStartingPoint(null)
    }
  }

  const handleEdit = (address: Address) => {
    setEditAddress(address)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditAddress(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">RouteTracker</h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de Rotas e Visitas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/history">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <DashboardStats route={currentRoute} />

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Endereços</h2>
                <p className="text-sm text-muted-foreground mt-1">Gerencie os locais das suas visitas</p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <AddressList addresses={addresses} onEdit={handleEdit} onRefresh={loadData} />
          </Card>

          {addresses.length > 0 && (
            <div className="flex gap-4">
              {currentRoute ? (
                <Button size="lg" className="flex-1" asChild>
                  <Link href="/route">
                    <Navigation className="h-5 w-5 mr-2" />
                    Continuar Rota
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="flex-1" onClick={handleStartRoute}>
                  <Navigation className="h-5 w-5 mr-2" />
                  Calcular e Iniciar Rota
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <AddAddressDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={loadData}
        editAddress={editAddress}
      />

      <StartingPointDialog
        open={startingPointOpen}
        onOpenChange={setStartingPointOpen}
        onConfirm={handleStartingPointConfirm}
      />

      <RoutePreviewDialog
        open={routePreviewOpen}
        onOpenChange={setRoutePreviewOpen}
        addresses={addresses}
        startingPoint={tempStartingPoint?.point}
        startingLat={tempStartingPoint?.lat}
        startingLng={tempStartingPoint?.lng}
        onConfirm={handleRouteConfirm}
      />

      <InstallPrompt />
    </div>
  )
}
