"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/components/user-provider"
import { FileText, BookOpen, FolderOpen, Star, Loader2 } from "lucide-react"

interface Favorite {
  id: string
  item_type: "wiki_page" | "course" | "file"
  item_id: string
  created_at: string
  title?: string
}

export default function FavoritosPage() {
  const { user, loading: userLoading } = useUser()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setLoading(false)
        return
      }

      const { data: favs } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (favs) {
        // Fetch titles for each favorite
        const enrichedFavs = await Promise.all(
          favs.map(async (fav) => {
            let title = "Sin titulo"
            if (fav.item_type === "wiki_page") {
              const { data } = await supabase
                .from("wiki_pages")
                .select("title")
                .eq("id", fav.item_id)
                .single()
              title = data?.title || title
            } else if (fav.item_type === "course") {
              const { data } = await supabase
                .from("courses")
                .select("title")
                .eq("id", fav.item_id)
                .single()
              title = data?.title || title
            } else if (fav.item_type === "file") {
              const { data } = await supabase
                .from("files")
                .select("name")
                .eq("id", fav.item_id)
                .single()
              title = data?.name || title
            }
            return { ...fav, title }
          })
        )
        setFavorites(enrichedFavs)
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [user, supabase])

  const getIcon = (type: Favorite["item_type"]) => {
    switch (type) {
      case "wiki_page": return <FileText className="h-4 w-4" />
      case "course": return <BookOpen className="h-4 w-4" />
      case "file": return <FolderOpen className="h-4 w-4" />
    }
  }

  const getHref = (fav: Favorite) => {
    switch (fav.item_type) {
      case "wiki_page": return `/wiki/${fav.item_id}`
      case "course": return `/cursos/${fav.item_id}`
      case "file": return `/archivos`
    }
  }

  const getTypeLabel = (type: Favorite["item_type"]) => {
    switch (type) {
      case "wiki_page": return "Wiki"
      case "course": return "Curso"
      case "file": return "Archivo"
    }
  }

  if (userLoading || loading) {
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
          <div className="max-w-4xl mx-auto px-8 py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Inicia sesion</h1>
            <p className="text-muted-foreground mb-6">
              Para ver tus favoritos necesitas iniciar sesion
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
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Favoritos</h1>
            <p className="text-muted-foreground">
              Tu contenido guardado para acceso rapido
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aun no tenes favoritos. Marca contenido con la estrella para guardarlo aca.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={getHref(fav)}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {getIcon(fav.item_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {fav.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getTypeLabel(fav.item_type)}
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
