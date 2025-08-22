"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Star, GitCommit } from "lucide-react"

interface GitHubRepo {
  name: string
  description: string
  language: string
  stars: number
  lastCommit: string
  url: string
}

export function GitHubActivity() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate GitHub API call with mock data
    const mockRepos: GitHubRepo[] = [
      {
        name: "automation-workflows",
        description: "Custom automation workflow templates for business processes",
        language: "C#",
        stars: 24,
        lastCommit: "2 days ago",
        url: "#",
      },
      {
        name: "medical-data-sync",
        description: "Secure medical data synchronization platform",
        language: "TypeScript",
        stars: 18,
        lastCommit: "5 days ago",
        url: "#",
      },
      {
        name: "test-automation-framework",
        description: "Comprehensive testing automation templates",
        language: "C#",
        stars: 31,
        lastCommit: "1 week ago",
        url: "#",
      },
    ]

    setTimeout(() => {
      setRepos(mockRepos)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Recent GitHub Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Recent GitHub Activity</h3>
      </div>
      <div className="space-y-4">
        {repos.map((repo) => (
          <div key={repo.name} className="border-l-2 border-primary/20 pl-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm hover:text-primary transition-colors cursor-pointer">{repo.name}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3" />
                {repo.stars}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{repo.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {repo.language}
              </Badge>
              <div className="flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                {repo.lastCommit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
