"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"

interface ProjectFilterProps {
  tags: string[]
  onFilterChange: (filters: { search: string; selectedTags: string[] }) => void
}

export function ProjectFilter({ tags, onFilterChange }: ProjectFilterProps) {
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, selectedTags })
  }

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    setSelectedTags(newSelectedTags)
    onFilterChange({ search, selectedTags: newSelectedTags })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedTags([])
    onFilterChange({ search: "", selectedTags: [] })
  }

  const hasActiveFilters = search || selectedTags.length > 0

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {selectedTags.length > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {selectedTags.length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-medium mb-3">Filter by Technology</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className="text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
