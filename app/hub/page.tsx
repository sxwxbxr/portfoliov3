"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../components/AuthProvider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { FileUpload } from "../../components/FileUpload"
import { PollCard } from "../../components/PollCard"
import { CreatePollModal } from "../../components/CreatePollModal"
import {
  Heart,
  MessageCircle,
  Share2,
  Clock,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Download,
  Search,
  Filter,
  File,
  ImageIcon,
  Code,
  Trash2,
  Plus,
} from "lucide-react"
import { newsFeeds, sharedFiles as initialSharedFiles, votingPolls as initialVotingPolls } from "../../src/config"
import Navigation from "../../components/Navigation"

export default function HubPage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [sharedFiles, setSharedFiles] = useState(initialSharedFiles)
  const [fileSearchTerm, setFileSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState("all")
  const [votingPolls, setVotingPolls] = useState(initialVotingPolls)
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
      }
      return newLiked
    })
  }

  const handleFileUploaded = (newFile: any) => {
    setSharedFiles((prev) => [newFile, ...prev])
  }

  const handleFileDownload = (fileId: string) => {
    setSharedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, downloads: file.downloads + 1 } : file)),
    )
  }

  const handleFileDelete = (fileId: string) => {
    setSharedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleVote = (pollId: string, optionId: string) => {
    // Update user votes
    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }))

    // Update poll data
    setVotingPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map((option) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
          )
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1,
          }
        }
        return poll
      }),
    )
  }

  const handleCreatePoll = (newPoll: any) => {
    setVotingPolls((prev) => [newPoll, ...prev])
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "document":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "code":
        return <Code className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredFiles = sharedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
    const matchesType = fileTypeFilter === "all" || file.type === fileTypeFilter
    return matchesSearch && matchesType
  })

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const activePolls = votingPolls.filter((poll) => poll.isActive && new Date(poll.endsAt) > new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg font-semibold">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-muted-foreground">Your personal hub for updates, files, and collaboration</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-muted-foreground">Active Servers</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-sm text-muted-foreground">Friends Online</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/20">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{sharedFiles.length}</p>
                  <p className="text-sm text-muted-foreground">Shared Files</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/20">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{activePolls.length}</p>
                  <p className="text-sm text-muted-foreground">Active Polls</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Activity Feed</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Polls</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
            </TabsList>

            {/* News Feed Tab */}
            <TabsContent value="feed" className="space-y-6">
              <div className="grid gap-6">
                {newsFeeds.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/professional-headshot.png" alt={post.author} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                              SW
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{post.author}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(post.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Gaming
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                      </div>

                      {post.image && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 ${
                              likedPosts.has(post.id) ? "text-red-500" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                            <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-2 text-muted-foreground"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-6">
              <FileUpload onFileUploaded={handleFileUploaded} />

              {/* File Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={fileSearchTerm}
                        onChange={(e) => setFileSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={fileTypeFilter}
                        onChange={(e) => setFileTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="document">Documents</option>
                        <option value="pdf">PDFs</option>
                        <option value="code">Code</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Files Grid */}
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{file.size}</span>
                              <span>by {file.uploadedBy}</span>
                              <span>{formatTimeAgo(file.uploadedAt)}</span>
                              <span>{file.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileDownload(file.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {(isAdmin || file.uploadedBy === user?.name) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredFiles.length === 0 && (
                  <Card className="p-8 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No files found</h3>
                    <p className="text-muted-foreground">
                      {fileSearchTerm || fileTypeFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Upload your first file to get started."}
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Polls Tab */}
            <TabsContent value="polls" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Voting Polls</h2>
                  <p className="text-muted-foreground">Participate in community decisions</p>
                </div>
                <Button
                  onClick={() => setIsCreatePollOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Poll
                </Button>
              </div>

              <div className="grid gap-6">
                {votingPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} onVote={handleVote} userVotes={userVotes} />
                ))}

                {votingPolls.length === 0 && (
                  <Card className="p-8 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
                    <p className="text-muted-foreground">Create your first poll to get started.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team">
              <Card className="p-8 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Friends & Gaming Buddies</h3>
                <p className="text-muted-foreground">Friend management and gaming stats will be implemented next.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  )
}
