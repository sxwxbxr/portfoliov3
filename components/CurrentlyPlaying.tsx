"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Music, Play, Pause } from "lucide-react"

interface Track {
  name: string
  artist: string
  album: string
  isPlaying: boolean
  progress: number
  duration: number
}

export function CurrentlyPlaying() {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate Spotify API call with mock data
    const mockTrack: Track = {
      name: "Focused Flow",
      artist: "Lo-Fi Study Beats",
      album: "Coding Sessions",
      isPlaying: true,
      progress: 142,
      duration: 240,
    }

    setTimeout(() => {
      setTrack(mockTrack)
      setLoading(false)
    }, 800)

    // Simulate progress updates
    const interval = setInterval(() => {
      setTrack((prev) => {
        if (!prev || !prev.isPlaying) return prev
        const newProgress = prev.progress + 1
        return {
          ...prev,
          progress: newProgress > prev.duration ? 0 : newProgress,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!track) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Music className="w-5 h-5" />
          <span className="text-sm">Not currently playing</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
          <Music className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{track.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          {track.isPlaying ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(track.progress / track.duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(track.progress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>
    </Card>
  )
}
