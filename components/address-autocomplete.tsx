"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"

interface AddressSuggestion {
  description: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectAddress: (address: string, lat: number, lng: number) => void
  placeholder?: string
}

export function AddressAutocomplete({ value, onChange, onSelectAddress, placeholder }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (value.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=br&limit=5`,
          {
            headers: {
              "User-Agent": "RouteTrackerApp/1.0",
            },
          },
        )
        const data = await response.json()

        const results: AddressSuggestion[] = data.map((item: any) => ({
          description: item.display_name,
          lat: Number.parseFloat(item.lat),
          lng: Number.parseFloat(item.lon),
        }))

        setSuggestions(results)
        setShowSuggestions(true)
      } catch (error) {
        console.error("[v0] Error fetching address suggestions:", error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value])

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description)
    onSelectAddress(suggestion.description, suggestion.lat, suggestion.lng)
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors flex items-start gap-2"
                onClick={() => handleSelect(suggestion)}
              >
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{suggestion.description}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
