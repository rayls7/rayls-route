"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, AlertCircle } from "lucide-react"
import { optimizeRoute, calculateTotalDistance, formatDistance } from "@/lib/route-optimizer"
import type { Address } from "@/lib/types"

interface RoutePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addresses: Address[]
  startingPoint?: string
  startingLat?: number
  startingLng?: number
  onConfirm: () => void
}

export function RoutePreviewDialog({
  open,
  onOpenChange,
  addresses,
  startingPoint,
  startingLat,
  startingLng,
  onConfirm,
}: RoutePreviewDialogProps) {
  const optimizedAddresses = optimizeRoute(addresses, startingLat, startingLng)
  const totalDistance = calculateTotalDistance(optimizedAddresses)
  const addressesWithCoords = optimizedAddresses.filter((addr) => addr.lat && addr.lng)
  const addressesWithoutCoords = optimizedAddresses.filter((addr) => !addr.lat || !addr.lng)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rota Otimizada</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {startingPoint && (
            <Card className="p-4 bg-primary/5 border-primary">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  0
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">Ponto de Partida</p>
                  <p className="text-sm text-muted-foreground">{startingPoint}</p>
                </div>
              </div>
            </Card>
          )}

          {addressesWithCoords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Ordem Otimizada</h3>
                {totalDistance > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Distância estimada:{" "}
                    <span className="font-semibold text-foreground">{formatDistance(totalDistance)}</span>
                  </div>
                )}
              </div>

              {optimizedAddresses.map((addr, index) => (
                <Card key={addr.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-secondary text-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{addr.name}</p>
                        {addr.priority === "high" && (
                          <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Alta</span>
                        )}
                        {addr.priority === "medium" && (
                          <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">Média</span>
                        )}
                        {addr.priority === "low" && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Baixa</span>
                        )}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="break-words">{addr.address}</p>
                      </div>
                      {addr.distanceFromPrevious !== undefined && addr.distanceFromPrevious > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <Navigation className="h-3 w-3 inline mr-1" />
                          {formatDistance(addr.distanceFromPrevious)} do ponto anterior
                        </p>
                      )}
                      {!addr.lat && !addr.lng && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          Sem coordenadas GPS
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {addressesWithoutCoords.length > 0 && addressesWithCoords.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Otimização Limitada</p>
                  <p className="text-sm text-muted-foreground">
                    Nenhum endereço possui coordenadas GPS. A rota será ordenada apenas por prioridade. Adicione
                    coordenadas GPS aos endereços para otimização automática da rota.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <Navigation className="h-4 w-4 mr-2" />
            Iniciar Rota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
