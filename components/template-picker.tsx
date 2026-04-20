"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Template {
  id: string
  name: string
  emoji: string
  content: string
  category: string
}

interface TemplatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: Template) => void
}

export function TemplatePicker({ open, onOpenChange, onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  async function loadTemplates() {
    const supabase = createClient()
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("category", { ascending: true })

    if (data) setTemplates(data)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Elegir plantilla</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                onSelect({ id: "", name: "", emoji: "📄", content: "", category: "" })
                onOpenChange(false)
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-foreground">Nota en blanco</p>
                <p className="text-sm text-muted-foreground">Empezar desde cero</p>
              </div>
            </button>
            
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template)
                  onOpenChange(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl">{template.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {template.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
