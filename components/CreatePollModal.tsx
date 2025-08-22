"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { X, Plus, Trash2 } from "lucide-react"
import { useAuth } from "./AuthProvider"

interface CreatePollModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePoll: (poll: any) => void
}

export function CreatePollModal({ isOpen, onClose, onCreatePoll }: CreatePollModalProps) {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [duration, setDuration] = useState("7") // days

  if (!isOpen) return null

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill in all fields")
      return
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + Number.parseInt(duration))

    const newPoll = {
      id: Date.now().toString(),
      question: question.trim(),
      options: options.map((opt, index) => ({
        id: String.fromCharCode(97 + index), // a, b, c, etc.
        text: opt.trim(),
        votes: 0,
      })),
      createdBy: user?.name || "Unknown",
      createdAt: new Date().toISOString(),
      endsAt: endDate.toISOString(),
      totalVotes: 0,
      isActive: true,
    }

    onCreatePoll(newPoll)

    // Reset form
    setQuestion("")
    setOptions(["", ""])
    setDuration("7")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Create New Poll</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">1 week</option>
                <option value="14">2 weeks</option>
                <option value="30">1 month</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Create Poll
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
