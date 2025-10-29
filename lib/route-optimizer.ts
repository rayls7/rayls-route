import { calculateDistance } from "./geolocation"
import type { Address } from "./types"

export interface OptimizedAddress extends Address {
  distanceFromPrevious?: number
  estimatedOrder: number
}

/**
 * Optimizes route using Nearest Neighbor algorithm
 * Starts from a given point and always visits the nearest unvisited address
 */
export function optimizeRoute(addresses: Address[], startLat?: number, startLng?: number): OptimizedAddress[] {
  // Filter addresses that have coordinates
  const addressesWithCoords = addresses.filter((addr) => addr.lat && addr.lng)
  const addressesWithoutCoords = addresses.filter((addr) => !addr.lat || !addr.lng)

  // If no coordinates available, sort by priority only
  if (addressesWithCoords.length === 0) {
    return addresses
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const aPriority = priorityOrder[a.priority || "medium"]
        const bPriority = priorityOrder[b.priority || "medium"]
        return aPriority - bPriority
      })
      .map((addr, index) => ({
        ...addr,
        estimatedOrder: index + 1,
      }))
  }

  const optimized: OptimizedAddress[] = []
  const unvisited = [...addressesWithCoords]
  let currentLat = startLat
  let currentLng = startLng

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    // Find nearest unvisited address
    for (let i = 0; i < unvisited.length; i++) {
      const addr = unvisited[i]
      if (!addr.lat || !addr.lng) continue

      let distance: number
      if (currentLat !== undefined && currentLng !== undefined) {
        distance = calculateDistance(currentLat, currentLng, addr.lat, addr.lng)
      } else {
        // If no starting point, prioritize high priority addresses
        distance = addr.priority === "high" ? 0 : addr.priority === "medium" ? 1 : 2
      }

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    // Add nearest address to optimized route
    const nearest = unvisited[nearestIndex]
    optimized.push({
      ...nearest,
      distanceFromPrevious: currentLat !== undefined ? nearestDistance : undefined,
      estimatedOrder: optimized.length + 1,
    })

    // Update current position
    currentLat = nearest.lat
    currentLng = nearest.lng

    // Remove from unvisited
    unvisited.splice(nearestIndex, 1)
  }

  // Add addresses without coordinates at the end
  addressesWithoutCoords.forEach((addr, index) => {
    optimized.push({
      ...addr,
      estimatedOrder: optimized.length + 1,
    })
  })

  return optimized
}

/**
 * Calculate total estimated distance for a route
 */
export function calculateTotalDistance(addresses: OptimizedAddress[]): number {
  return addresses.reduce((total, addr) => {
    return total + (addr.distanceFromPrevious || 0)
  }, 0)
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}
