"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Search, FileText, BookOpen, FolderOpen, Loader2 } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  type: "wiki" | "course" | "file"
  description?: string
}

export function SearchDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const searchTerm = `%${searchQuery}%`

    const [wikiRes, coursesRes, filesRes] = await Promise.all([
      supabase
        .from("wiki_pages")
        .select("id, title")
        .ilike("title", searchTerm)
        .limit(5),
      supabase
        .from("courses")
        .select("id, title, description")
        .ilike("title", searchTerm)
        .limit(5),
      supabase
        .from("files")
        .select("id, name")
        .ilike("name", searchTerm)
        .limit(5),
    ])

    const combined: SearchResult[] = [
      ...(wikiRes.data?.map(w => ({ id: w.id, title: w.title, type: "wiki" as const })) || []),
      ...(coursesRes.data?.map(c => ({ id: c.id, title: c.title, type: "course" as const, description: c.description })) || []),
      ...(filesRes.data?.map(f => ({ id: f.id, title: f.name, type: "file" as const })) || []),
    ]

    setResults(combined)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, search])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false)
    if (result.type === "wiki") {
      router.push(`/wiki/${result.id}`)
    } else if (result.type === "course") {
      router.push(`/cursos/${result.id}`)
    } else {
      router.push(`/archivos`)
    }
  }

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "wiki": return <FileText className="h-4 w-4" />
      case "course": return <BookOpen className="h-4 w-4" />
      case "file": return <FolderOpen className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "wiki": return "Wiki"
      case "course": return "Curso"
      case "file": return "Archivo"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en PonchoCamp..."
            className="border-0 focus-visible:ring-0 px-0 py-4 text-base"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && query && !loading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No se encontraron resultados para &quot;{query}&quot;
            </p>
          )}

          {results.length === 0 && !query && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Escribe para buscar en wiki, cursos y archivos
            </p>
          )}

          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {getIcon(result.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {result.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getTypeLabel(result.type)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
