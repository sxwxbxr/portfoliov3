"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../components/AuthProvider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Shield,
  Settings,
  Activity,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
} from "lucide-react"
import { users as initialUsers, newsFeeds, sharedFiles, votingPolls } from "../../src/config"
import Navigation from "../../components/Navigation"

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/hub")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own account")
      return
    }
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  const handleToggleUserRole = (userId: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own role")
      return
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u)))
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const regularUsers = users.filter((u) => u.role === "user").length
  const totalFiles = sharedFiles.length
  const totalPolls = votingPolls.length
  const totalPosts = newsFeeds.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg border border-red-200/20">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage users, content, and system settings</p>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-blue-600">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/20">
                <CardContent className="p-4 text-center">
                  <UserCheck className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-600">{adminUsers}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/20">
                <CardContent className="p-4 text-center">
                  <UserX className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-purple-600">{regularUsers}</p>
                  <p className="text-xs text-muted-foreground">Regular Users</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/20">
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-orange-600">{totalFiles}</p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-200/20">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-cyan-600">{totalPolls}</p>
                  <p className="text-xs text-muted-foreground">Polls</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-200/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-pink-600">{totalPosts}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              {/* User Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="user">Users</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="p-4 font-medium">User</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Role</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                    {u.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-sm text-muted-foreground">ID: {u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{u.email}</p>
                            </td>
                            <td className="p-4">
                              <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                                {u.role === "admin" ? (
                                  <>
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  <>
                                    <Users className="h-3 w-3 mr-1" />
                                    User
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingUser(u)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserRole(u.id)}
                                  className="text-muted-foreground hover:text-blue-500"
                                  disabled={u.id === user?.id}
                                >
                                  {u.role === "admin" ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-muted-foreground hover:text-red-500"
                                  disabled={u.id === user?.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Content Management</h2>
                <p className="text-muted-foreground">Monitor and manage platform content</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span>News Posts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Posts</span>
                        <span className="font-medium">{newsFeeds.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">This Week</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Likes</span>
                        <span className="font-medium">{newsFeeds.reduce((sum, post) => sum + post.likes, 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span>Shared Files</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Files</span>
                        <span className="font-medium">{sharedFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">This Week</span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Downloads</span>
                        <span className="font-medium">
                          {sharedFiles.reduce((sum, file) => sum + file.downloads, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <span>Voting Polls</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Polls</span>
                        <span className="font-medium">{votingPolls.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <span className="font-medium">{votingPolls.filter((p) => p.isActive).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Votes</span>
                        <span className="font-medium">
                          {votingPolls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Analytics Overview</h2>
                <p className="text-muted-foreground">Platform usage statistics and insights</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Daily Active Users</span>
                        <span className="font-bold text-green-600">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly Active Users</span>
                        <span className="font-bold text-blue-600">48</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Monthly Active Users</span>
                        <span className="font-bold text-purple-600">156</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Post Likes</span>
                        <span className="font-bold text-red-600">11.7</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">File Download Rate</span>
                        <span className="font-bold text-orange-600">26.7</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Poll Participation</span>
                        <span className="font-bold text-cyan-600">52.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">System Settings</h2>
                <p className="text-muted-foreground">Configure platform settings and preferences</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input id="site-name" defaultValue="Seya Weber Hub" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                      <Input id="max-file-size" type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poll-duration">Default Poll Duration (days)</Label>
                      <Input id="poll-duration" type="number" defaultValue="7" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Email Verification</p>
                        <p className="text-sm text-muted-foreground">New users must verify their email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable File Scanning</p>
                        <p className="text-sm text-muted-foreground">Scan uploaded files for security</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-moderate Content</p>
                        <p className="text-sm text-muted-foreground">Automatically flag inappropriate content</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-600">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
                    </div>
                    <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reset Platform
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
