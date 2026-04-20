"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ArrowLeft, Save, Eye, Edit2, Loader2, FileTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/components/user-provider"
import { TemplatePicker } from "@/components/template-picker"
import ReactMarkdown from "react-markdown"

const emojis = ["📄", "📝", "📚", "💡", "🎯", "📊", "💰", "📈", "🔧", "⚙️", "🚀", "✨"]

interface Tag {
  id: string
  name: string
  color: string
}

export default function NewWikiPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [title, setTitle] = useState("")
  const [emoji, setEmoji] = useState("📄")
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const supabase = createClient()

  const handleTemplateSelect = (template: { emoji: string; content: string; name: string }) => {
    if (template.content) {
      setContent(template.content)
      setEmoji(template.emoji)
      if (template.name) {
        setTitle("")
      }
    }
    setShowTemplatePicker(false)
  }

  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from("tags").select("*").order("name")
      if (data) setTags(data)
    }
    fetchTags()
  }, [supabase])

  const handleSave = async () => {
    if (!user || !title) return

    setSaving(true)

    const { data: page, error } = await supabase
      .from("wiki_pages")
      .insert({
        title,
        emoji,
        content,
        author_id: user.id,
      })
      .select()
      .single()

    if (error) {
      alert("Error al guardar: " + error.message)
      setSaving(false)
      return
    }

    // Add tags
    if (selectedTags.length > 0 && page) {
      await supabase.from("wiki_page_tags").insert(
        selectedTags.map((tagId) => ({
          wiki_page_id: page.id,
          tag_id: tagId,
        }))
      )
    }

    // Log activity
    if (page) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action_type: "create_page",
        target_type: "wiki_page",
        target_id: page.id,
        target_title: title,
      })
    }

    router.push(`/wiki/${page.id}`)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  if (userLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-60 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-60">
          <div className="max-w-3xl mx-auto px-8 py-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Inicia sesion</h1>
            <p className="text-muted-foreground mb-6">
              Para crear notas necesitas iniciar sesion
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Iniciar sesion
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-60">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Template Picker */}
          <TemplatePicker
            open={showTemplatePicker}
            onOpenChange={setShowTemplatePicker}
            onSelect={handleTemplateSelect}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/wiki"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowTemplatePicker(true)}
              >
                <FileTemplate className="h-4 w-4" />
                Plantilla
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setPreview(!preview)}
              >
                {preview ? (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Vista previa
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                className="gap-2" 
                onClick={handleSave} 
                disabled={!title || saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-6">
            {/* Title with emoji */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-4xl hover:bg-accent rounded-lg p-2 transition-colors"
                >
                  {emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-card border border-border rounded-lg shadow-lg grid grid-cols-6 gap-1 z-10">
                    {emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setEmoji(e)
                          setShowEmojiPicker(false)
                        }}
                        className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo de la nota"
                className="flex-1 text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id)
                        ? tag.color
                        : `${tag.color}20`,
                      color: selectedTags.includes(tag.id) ? "white" : tag.color,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {preview ? (
              <article className="prose prose-neutral max-w-none min-h-[400px] p-4 rounded-lg border border-border bg-card">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-4 text-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-4 text-foreground">
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {content || "*Empeza a escribir para ver la vista previa*"}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Escribi en Markdown. Usa # para titulos, **texto** para negrita, - para listas.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Empeza a escribir tu contenido..."
                  className="w-full min-h-[400px] p-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono text-sm leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
