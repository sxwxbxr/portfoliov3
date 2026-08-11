"use client"

import { useState, type KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"
import { copy } from "@/lib/copy"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

const MAX_LENGTH = 500

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")

  function submit() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    // Opposite polarities, side by side: you type into the sunken thing and
    // press the raised one.
    <div className="flex items-end gap-2 border-t border-edge-soft p-3">
      <label htmlFor="chat-input" className="sr-only">
        {copy.chat.inputLabel}
      </label>
      <textarea
        id="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={MAX_LENGTH}
        placeholder={copy.chat.inputPlaceholder}
        className="field max-h-32 min-h-9 flex-1 resize-none px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label={copy.chat.send}
        className="control control-primary inline-flex h-9 w-9 shrink-0 items-center justify-center"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
