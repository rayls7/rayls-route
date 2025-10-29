"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Address } from "@/lib/types"
import { saveAddress, updateAddress } from "@/lib/storage"
import { AddressAutocomplete } from "@/components/address-autocomplete"

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

  const handleAddressSelect = (selectedAddress: string, selectedLat: number, selectedLng: number) => {
    setAddress(selectedAddress)
    setLat(selectedLat)
    setLng(selectedLng)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!lat || !lng) {
      alert("Por favor, selecione um endereço da lista para obter as coordenadas GPS.")
      return
    }

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
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                onSelectAddress={handleAddressSelect}
                placeholder="Digite o endereço e selecione da lista"
              />
              <p className="text-xs text-muted-foreground">
                Digite o endereço e selecione da lista para obter coordenadas GPS automaticamente
              </p>
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
