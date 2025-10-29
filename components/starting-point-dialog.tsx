"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation } from "lucide-react"
import { getCurrentPosition } from "@/lib/geolocation"

interface StartingPointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (startingPoint: string, lat?: number, lng?: number) => void
}

export function StartingPointDialog({ open, onOpenChange, onConfirm }: StartingPointDialogProps) {
  const [startingPoint, setStartingPoint] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUseGPS = async () => {
    setLoading(true)
    try {
      const position = await getCurrentPosition()
      setStartingPoint(`GPS: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao obter localização:", error)
      alert("Não foi possível obter a localização. Digite manualmente.")
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!startingPoint) {
      alert("Por favor, informe o ponto de partida")
      return
    }

    // If GPS was used, extract coordinates
    if (startingPoint.startsWith("GPS:")) {
      try {
        const position = await getCurrentPosition()
        onConfirm(startingPoint, position.latitude, position.longitude)
      } catch {
        onConfirm(startingPoint)
      }
    } else {
      onConfirm(startingPoint)
    }

    onOpenChange(false)
    setStartingPoint("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Qual é o seu ponto de partida?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="starting-point">Endereço ou Local</Label>
            <Input
              id="starting-point"
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
              placeholder="Ex: Rua Principal, 123 ou use GPS"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleUseGPS}
            disabled={loading}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {loading ? "Obtendo localização..." : "Usar Localização Atual (GPS)"}
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            <MapPin className="h-4 w-4 mr-2" />
            Confirmar e Iniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
