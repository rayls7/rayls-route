export interface Address {
  id: string
  name: string
  address: string
  notes?: string
  priority?: "high" | "medium" | "low"
  lat?: number
  lng?: number
  order: number
  createdAt: Date
}

export interface Visit {
  id: string
  addressId: string
  addressName: string
  address: string
  startTime: Date
  endTime?: Date
  startKm: number
  endKm?: number
  startPhoto?: string
  endPhoto?: string
  startLat?: number
  startLng?: number
  endLat?: number
  endLng?: number
  notes?: string
  observations?: string
  status: "pending" | "in-progress" | "completed"
}

export interface Route {
  id: string
  date: Date
  startingPoint?: string
  startingLat?: number
  startingLng?: number
  visits: Visit[]
  totalKm: number
  status: "planning" | "in-progress" | "completed"
}
