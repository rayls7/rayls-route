"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Loader2 } from "lucide-react"
import type { Address } from "@/lib/types"
import { saveAddress, updateAddress } from "@/lib/storage"
import { getCurrentPosition } from "@/lib/geolocation"

interface AddAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editAddress?: Address | null
}

export function AddAddressDialog({ open, onOpenChange, onSuccess, editAddress }: AddAddressDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [loadingGPS, setLoadingGPS] = useState(false)

  useEffect(() => {
    if (editAddress) {
      setName(editAddress.name)
      setAddress(editAddress.address)
      setNotes(editAddress.notes || "")
      setPriority(editAddress.priority || "medium")
      setLat(editAddress.lat)
      setLng(editAddress.lng)
    } else {
      setName("")
      setAddress("")
      setNotes("")
      setPriority("medium")
      setLat(undefined)
      setLng(undefined)
    }
  }, [editAddress, open])

  const handleGetLocation = async () => {
    setLoadingGPS(true)
    try {
      const position = await getCurrentPosition()
      setLat(position.latitude)
      setLng(position.longitude)
    } catch (error) {
      alert("Não foi possível obter a localização. Verifique as permissões.")
    } finally {
      setLoadingGPS(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editAddress) {
      updateAddress(editAddress.id, { name, address, notes, priority, lat, lng })
    } else {
      saveAddress({ name, address, notes, priority, lat, lng, order: 0 })
    }

    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editAddress ? "Editar Endereço" : "Adicionar Endereço"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estabelecimento</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cliente ABC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Coordenadas GPS (Opcional)</Label>
              <p className="text-xs text-muted-foreground">Adicione coordenadas para otimizar a rota automaticamente</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={loadingGPS}
                className="w-full bg-transparent"
              >
                {loadingGPS ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Obtendo localização...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Usar Localização Atual
                  </>
                )}
              </Button>
              {lat !== undefined && lng !== undefined && (
                <div className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                  Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Horário de atendimento, notas específicas..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editAddress ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
