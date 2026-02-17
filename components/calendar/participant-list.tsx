"use client"

import { X, UserPlus } from "lucide-react"
import { useState } from "react"

interface ParticipantListProps {
  participants: string[]
  onChange: (participants: string[]) => void
}

export function ParticipantList({ participants, onChange }: ParticipantListProps) {
  const [input, setInput] = useState("")

  const addParticipant = () => {
    const name = input.trim()
    if (name && !participants.includes(name)) {
      onChange([...participants, name])
      setInput("")
    }
  }

  const removeParticipant = (name: string) => {
    onChange(participants.filter((p) => p !== name))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addParticipant()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        Participants ({participants.length})
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add participant..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={addParticipant}
          disabled={!input.trim()}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
      </div>
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {p}
              <button
                type="button"
                onClick={() => removeParticipant(p)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                aria-label={`Remove ${p}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
