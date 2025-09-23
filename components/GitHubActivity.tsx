"use client"

import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AlertCircle, GitBranch, GitCommit, GitFork, GitPullRequest, Star } from "lucide-react"

const GITHUB_USERNAME = "sxwxbxr"
const EVENTS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`

type ActivityType = "push" | "pull_request" | "create" | "star" | "fork" | "issue" | "release" | "other"

interface GitHubEvent {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  created_at: string
  payload: Record<string, unknown>
}

interface ActivityItem {
  id: string
  title: string
  description?: string
  url: string
  repoName: string
  repoUrl: string
  timestamp: string
  type: ActivityType
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  push: "Push",
  pull_request: "Pull Request",
  create: "Create",
  star: "Star",
  fork: "Fork",
  issue: "Issue",
  release: "Release",
  other: "Activity",
}

type PushEventPayload = {
  commits?: Array<{
    message?: string
    url?: string
  }>
}

type PullRequestEventPayload = {
  action?: string
  pull_request?: {
    number?: number
    title?: string
    html_url?: string
  }
}

type CreateEventPayload = {
  ref_type?: string
  ref?: string
}

type ForkEventPayload = {
  forkee?: {
    html_url?: string
  }
}

type IssuesEventPayload = {
  action?: string
  issue?: {
    number?: number
    title?: string
    html_url?: string
  }
}

type ReleaseEventPayload = {
  action?: string
  release?: {
    tag_name?: string
    name?: string
    html_url?: string
  }
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "push":
      return <GitCommit className="h-3.5 w-3.5 text-primary" />
    case "pull_request":
      return <GitPullRequest className="h-3.5 w-3.5 text-primary" />
    case "star":
      return <Star className="h-3.5 w-3.5 text-primary" />
    case "fork":
      return <GitFork className="h-3.5 w-3.5 text-primary" />
    default:
      return <GitBranch className="h-3.5 w-3.5 text-primary" />
  }
}

const capitalize = (value?: string) => {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const toCommitUrl = (apiUrl?: string) => {
  if (!apiUrl) return undefined
  return apiUrl.replace("api.github.com/repos", "github.com").replace("/commits/", "/commit/")
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`

  const years = Math.floor(days / 365)
  return `${years}y ago`
}

const mapEventToActivity = (event: GitHubEvent): ActivityItem => {
  const repoName = event.repo?.name ?? ""
  const repoUrl = event.repo?.name ? `https://github.com/${event.repo.name}` : "https://github.com"
  const payload = event.payload ?? {}

  switch (event.type) {
    case "PushEvent": {
      const pushPayload = payload as PushEventPayload
      const commits = Array.isArray(pushPayload.commits) ? pushPayload.commits ?? [] : []
      const commitCount = commits.length
      const commitWord = commitCount === 1 ? "commit" : "commits"
      const commitMessage = commits[0]?.message?.split("\n")[0]
      const commitUrl = toCommitUrl(commits[0]?.url) ?? repoUrl

      return {
        id: event.id,
        type: "push",
        title: commitCount
          ? `Pushed ${commitCount} ${commitWord} to ${repoName}`
          : `Pushed updates to ${repoName}`,
        description: commitMessage,
        url: commitUrl,
        repoName,
        repoUrl,
        timestamp: event.created_at,
      }
    }
    case "PullRequestEvent": {
      const pullRequestPayload = payload as PullRequestEventPayload
      const action = pullRequestPayload.action ?? "updated"
      const pullRequest = pullRequestPayload.pull_request
      const prNumber = pullRequest?.number

      return {
        id: event.id,
        type: "pull_request",
        title: `${capitalize(action)} pull request${prNumber ? ` #${prNumber}` : ""} in ${repoName}`,
        description: pullRequest?.title ?? undefined,
        url: pullRequest?.html_url ?? repoUrl,
        repoName,
        repoUrl,
        timestamp: event.created_at,
      }
    }
    case "CreateEvent": {
      const createPayload = payload as CreateEventPayload
      const refType = createPayload.ref_type
      const ref = createPayload.ref

      let title = `Created ${refType ?? "content"}`
      if (refType === "repository") {
        title = `Created repository ${repoName}`
      } else if (refType === "branch" && ref) {
        title = `Created branch ${ref} in ${repoName}`
      } else if (refType === "tag" && ref) {
        title = `Created tag ${ref} in ${repoName}`
      }

      return {
        id: event.id,
        type: "create",
        title,
        repoName,
        repoUrl,
        url: repoUrl,
        timestamp: event.created_at,
      }
    }
    case "WatchEvent": {
      return {
        id: event.id,
        type: "star",
        title: `Starred ${repoName}`,
        repoName,
        repoUrl,
        url: repoUrl,
        timestamp: event.created_at,
      }
    }
    case "ForkEvent": {
      const forkPayload = payload as ForkEventPayload
      const forkee = forkPayload.forkee
      return {
        id: event.id,
        type: "fork",
        title: `Forked ${repoName}`,
        repoName,
        repoUrl,
        url: forkee?.html_url ?? repoUrl,
        timestamp: event.created_at,
      }
    }
    case "IssuesEvent": {
      const issuesPayload = payload as IssuesEventPayload
      const action = issuesPayload.action ?? "updated"
      const issue = issuesPayload.issue
      const issueNumber = issue?.number

      return {
        id: event.id,
        type: "issue",
        title: `${capitalize(action)} issue${issueNumber ? ` #${issueNumber}` : ""} in ${repoName}`,
        description: issue?.title ?? undefined,
        url: issue?.html_url ?? repoUrl,
        repoName,
        repoUrl,
        timestamp: event.created_at,
      }
    }
    case "ReleaseEvent": {
      const releasePayload = payload as ReleaseEventPayload
      const action = releasePayload.action ?? "published"
      const release = releasePayload.release
      const tagName = release?.tag_name

      return {
        id: event.id,
        type: "release",
        title: `${capitalize(action)} release${tagName ? ` ${tagName}` : ""} in ${repoName}`,
        description: release?.name ?? undefined,
        url: release?.html_url ?? repoUrl,
        repoName,
        repoUrl,
        timestamp: event.created_at,
      }
    }
    default:
      return {
        id: event.id,
        type: "other",
        title: `${event.type.replace(/Event$/, "")} activity in ${repoName}`,
        repoName,
        repoUrl,
        url: repoUrl,
        timestamp: event.created_at,
      }
  }
}

export function GitHubActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchActivity = async () => {
      try {
        const response = await fetch(EVENTS_ENDPOINT, {
          headers: {
            Accept: "application/vnd.github+json",
          },
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("GitHub rate limit reached. Please try again soon.")
          }
          if (response.status === 404) {
            throw new Error("GitHub profile not found.")
          }
          throw new Error("Unable to load GitHub activity.")
        }

        const data = (await response.json()) as unknown
        const events = Array.isArray(data) ? (data as GitHubEvent[]) : []
        const normalized = events
          .map((event) => mapEventToActivity(event))
          .filter((item): item is ActivityItem => Boolean(item))
          .slice(0, 3)

        if (!controller.signal.aborted) {
          setActivity(normalized)
          setError(null)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load GitHub activity.")
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchActivity()

    return () => {
      controller.abort()
    }
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent GitHub Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recent GitHub Activity</h3>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div className="space-y-2">
              <p>{error}</p>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Visit GitHub profile
              </a>
            </div>
          </div>
        </div>
      ) : activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No public activity found recently. Check out my
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center text-primary underline-offset-4 hover:underline"
          >
            GitHub profile
          </a>
          for more.
        </p>
      ) : (
        <div className="space-y-4">
          {activity.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-primary/20 pl-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-card-foreground transition-colors hover:text-primary"
                    >
                      {item.title}
                    </a>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    ) : null}
                  </div>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {ACTIVITY_TYPE_LABELS[item.type]}
                </Badge>
                <a
                  href={item.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {item.repoName}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
