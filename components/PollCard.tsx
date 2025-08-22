"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Clock, Users, CheckCircle, BarChart3 } from "lucide-react"
import { useAuth } from "./AuthProvider"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  createdBy: string
  createdAt: string
  endsAt: string
  totalVotes: number
  isActive: boolean
}

interface PollCardProps {
  poll: Poll
  onVote: (pollId: string, optionId: string) => void
  userVotes: Record<string, string>
}

export function PollCard({ poll, onVote, userVotes }: PollCardProps) {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  const userVote = userVotes[poll.id]
  const hasVoted = !!userVote

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return "Ending soon"
  }

  const handleVote = async (optionId: string) => {
    if (hasVoted || !poll.isActive) return

    setIsVoting(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    onVote(poll.id, optionId)
    setIsVoting(false)
  }

  const getOptionPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0
  }

  const isExpired = new Date(poll.endsAt) <= new Date()

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/professional-headshot.png" alt={poll.createdBy} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">SW</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{poll.createdBy}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTimeRemaining(poll.endsAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={poll.isActive && !isExpired ? "default" : "secondary"} className="text-xs">
              {poll.isActive && !isExpired ? "Active" : "Ended"}
            </Badge>
            {hasVoted && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{poll.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = getOptionPercentage(option.votes)
            const isSelected = userVote === option.id
            const canVote = !hasVoted && poll.isActive && !isExpired

            return (
              <div key={option.id} className="space-y-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-4 ${
                    canVote ? "hover:bg-muted" : "cursor-default"
                  } ${isSelected ? "bg-gradient-to-r from-primary to-secondary" : ""}`}
                  onClick={() => canVote && handleVote(option.id)}
                  disabled={isVoting || !canVote}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex-1">{option.text}</span>
                    {hasVoted && (
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-sm font-medium">{percentage}%</span>
                        <span className="text-xs text-muted-foreground">({option.votes})</span>
                      </div>
                    )}
                  </div>
                </Button>

                {hasVoted && (
                  <div className="px-4">
                    <Progress
                      value={percentage}
                      className="h-2"
                      style={{
                        background: isSelected ? "rgba(99, 102, 241, 0.2)" : undefined,
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>{poll.options.length} options</span>
            </div>
          </div>
          {!hasVoted && poll.isActive && !isExpired && (
            <Badge variant="outline" className="text-xs">
              Click to vote
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
