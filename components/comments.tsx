"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/components/user-provider"
import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: {
    full_name: string | null
  } | null
}

export function Comments({ pageId }: { pageId: string }) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadComments()
  }, [pageId])

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(full_name)")
      .eq("wiki_page_id", pageId)
      .order("created_at", { ascending: true })

    if (data) setComments(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from("comments")
      .insert({
        wiki_page_id: pageId,
        author_id: user.id,
        content: newComment.trim(),
      })
      .select("*, profiles(full_name)")
      .single()

    if (!error && data) {
      setComments([...comments, data])
      setNewComment("")
      
      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action_type: "comment",
        target_type: "wiki_page",
        target_id: pageId,
      })
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    await supabase.from("comments").delete().eq("id", commentId)
    setComments(comments.filter((c) => c.id !== commentId))
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando comentarios...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Comentarios ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin comentarios aun. Se el primero en comentar.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {comment.profiles?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profiles?.full_name || "Usuario"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">{comment.content}</p>
              </div>
              {user?.id === comment.author_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim() || submitting}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  )
}
