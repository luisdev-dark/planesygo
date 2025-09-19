"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { icons } from "@/lib/icons"
import { useRouter } from "next/navigation"

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  recentSearches?: string[]
}

export function SearchBar({
  placeholder = "Busca una ciudad, país o punto de interés...",
  className = "",
  onSearch,
  recentSearches = [],
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const SearchIcon = icons.search
  const XIcon = icons.close

  useEffect(() => {
    // Focus input when "/" is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/app/plan?destination=${encodeURIComponent(query)}`)
      }
      setIsOpen(false)
    }
  }

  const handleRecentSearch = (search: string) => {
    setQuery(search)
    if (onSearch) {
      onSearch(search)
    } else {
      router.push(`/app/plan?destination=${encodeURIComponent(search)}`)
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 rounded-xl"
          aria-label="Buscar destinos"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => setQuery("")}
            aria-label="Limpiar búsqueda"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Recent searches popover */}
      {isOpen && recentSearches.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-xl" align="start" sideOffset={10}>
            <div className="p-4">
              <h4 className="text-sm font-medium mb-2">Búsquedas recientes</h4>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start rounded-lg"
                    onClick={() => handleRecentSearch(search)}
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-lg"
                onClick={() => {
                  setQuery("")
                  setIsOpen(false)
                }}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Limpiar historial
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
