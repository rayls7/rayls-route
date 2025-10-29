"use client"

import type { Address, Visit, Route } from "./types"
import { optimizeRoute } from "./route-optimizer"

const STORAGE_KEYS = {
  ADDRESSES: "route-tracker-addresses",
  ROUTES: "route-tracker-routes",
  CURRENT_ROUTE: "route-tracker-current-route",
}

// Address Management
export function getAddresses(): Address[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES)
  return data ? JSON.parse(data) : []
}

export function saveAddress(address: Omit<Address, "id" | "createdAt">): Address {
  const addresses = getAddresses()
  const newAddress: Address = {
    ...address,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }
  addresses.push(newAddress)
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
  return newAddress
}

export function updateAddress(id: string, updates: Partial<Address>): void {
  const addresses = getAddresses()
  const index = addresses.findIndex((a) => a.id === id)
  if (index !== -1) {
    addresses[index] = { ...addresses[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
  }
}

export function deleteAddress(id: string): void {
  const addresses = getAddresses().filter((a) => a.id !== id)
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
}

// Route Management
export function getRoutes(): Route[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ROUTES)
  if (!data) return []
  return JSON.parse(data, (key, value) => {
    if (key === "date" || key === "startTime" || key === "endTime" || key === "createdAt") {
      return value ? new Date(value) : value
    }
    return value
  })
}

export function getCurrentRoute(): Route | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ROUTE)
  if (!data) return null
  return JSON.parse(data, (key, value) => {
    if (key === "date" || key === "startTime" || key === "endTime") {
      return value ? new Date(value) : value
    }
    return value
  })
}

export function createRoute(addresses: Address[], startLat?: number, startLng?: number): Route {
  const optimizedAddresses = optimizeRoute(addresses, startLat, startLng)

  const route: Route = {
    id: crypto.randomUUID(),
    date: new Date(),
    visits: optimizedAddresses.map((addr) => ({
      id: crypto.randomUUID(),
      addressId: addr.id,
      addressName: addr.name,
      address: addr.address,
      lat: addr.lat,
      lng: addr.lng,
      startTime: new Date(),
      startKm: 0,
      status: "pending" as const,
    })),
    totalKm: 0,
    status: "planning",
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(route))
  return route
}

export function updateCurrentRoute(route: Route): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(route))
}

export function completeRoute(route: Route): void {
  const routes = getRoutes()
  routes.push(route)
  localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes))
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ROUTE)
}

export function updateVisit(routeId: string, visitId: string, updates: Partial<Visit>): void {
  const route = getCurrentRoute()
  if (route && route.id === routeId) {
    const visitIndex = route.visits.findIndex((v) => v.id === visitId)
    if (visitIndex !== -1) {
      route.visits[visitIndex] = { ...route.visits[visitIndex], ...updates }
      updateCurrentRoute(route)
    }
  }
}

export function addAddressToRoute(address: Address): void {
  const route = getCurrentRoute()
  if (route) {
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      addressId: address.id,
      addressName: address.name,
      address: address.address,
      lat: address.lat,
      lng: address.lng,
      startTime: new Date(),
      startKm: 0,
      status: "pending" as const,
    }
    route.visits.push(newVisit)

    // Re-optimize remaining pending visits
    const completedVisits = route.visits.filter((v) => v.status === "completed")
    const pendingVisits = route.visits.filter((v) => v.status === "pending")

    if (pendingVisits.length > 0) {
      // Get current location from last completed visit or use first pending
      let currentLat: number | undefined
      let currentLng: number | undefined

      if (completedVisits.length > 0) {
        const lastCompleted = completedVisits[completedVisits.length - 1]
        currentLat = lastCompleted.endLat
        currentLng = lastCompleted.endLng
      }

      // Convert visits to addresses for optimization
      const pendingAddresses: Address[] = pendingVisits.map((v) => ({
        id: v.addressId,
        name: v.addressName,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        priority: "medium",
        order: 0,
        createdAt: new Date(),
      }))

      const optimized = optimizeRoute(pendingAddresses, currentLat, currentLng)

      // Update visits with optimized order
      const optimizedVisits = optimized.map((addr) => {
        const visit = pendingVisits.find((v) => v.addressId === addr.id)
        return visit!
      })

      route.visits = [...completedVisits, ...optimizedVisits]
    }

    updateCurrentRoute(route)
  }
}
