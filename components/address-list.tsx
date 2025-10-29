"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trash2, Edit, GripVertical } from "lucide-react"
import type { Address } from "@/lib/types"
import { deleteAddress } from "@/lib/storage"

interface AddressListProps {
  addresses: Address[]
  onEdit: (address: Address) => void
  onRefresh: () => void
}

export function AddressList({ addresses, onEdit, onRefresh }: AddressListProps) {
  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este endereço?")) {
      deleteAddress(id)
      onRefresh()
    }
  }

  if (addresses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum endereço cadastrado</h3>
        <p className="text-muted-foreground">Adicione endereços para começar a planejar suas rotas</p>
      </Card>
    )
  }

  const sortedAddresses = [...addresses].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const aPriority = priorityOrder[a.priority || "medium"]
    const bPriority = priorityOrder[b.priority || "medium"]
    return aPriority - bPriority
  })

  const getPriorityColor = (priority?: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  const getPriorityLabel = (priority?: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "Alta"
      case "low":
        return "Baixa"
      default:
        return "Média"
    }
  }

  return (
    <div className="space-y-3">
      {sortedAddresses.map((address, index) => (
        <Card key={address.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GripVertical className="h-5 w-5" />
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{address.name}</h3>
                <Badge variant="outline" className={getPriorityColor(address.priority)}>
                  {getPriorityLabel(address.priority)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
              {address.notes && <p className="text-sm text-muted-foreground mt-2 italic">{address.notes}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
