import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Plus, Clock, User, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function WikiPage() {
  const supabase = await createClient()
  
  const { data: pages } = await supabase
    .from("wiki_pages")
    .select(`
      id, 
      title, 
      emoji, 
      created_at, 
      updated_at,
      author_id,
      profiles(full_name),
      wiki_page_tags(
        tags(id, name, color)
      )
    `)
    .order("updated_at", { ascending: false })

  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Notas del equipo</h1>
              <p className="text-muted-foreground mt-1">
                Documentacion, guias y recursos compartidos
              </p>
            </div>
            <Link href="/wiki/nueva">
              <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" />
                Nueva nota
              </Button>
            </Link>
          </div>

          {/* Tags filter */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium bg-foreground text-background">
                Todas
              </span>
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Pages list */}
          {pages && pages.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.id}`}
                  className="group flex items-center gap-4 p-5 hover:bg-accent/50 transition-colors"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl shrink-0">
                    {page.emoji || "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {page.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {page.wiki_page_tags && page.wiki_page_tags.length > 0 && (
                        <div className="flex gap-1.5">
                          {page.wiki_page_tags.slice(0, 3).map((wpt: { tags: { id: string; name: string; color: string } | null }) => 
                            wpt.tags && (
                              <span
                                key={wpt.tags.id}
                                className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
                                style={{ backgroundColor: `${wpt.tags.color}15`, color: wpt.tags.color }}
                              >
                                {wpt.tags.name}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {(page.profiles as { full_name: string } | null)?.full_name || "Equipo"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(page.updated_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-foreground mb-2">
                Aun no hay notas
              </p>
              <p className="text-muted-foreground mb-6">
                Crea la primera nota para compartir con el equipo
              </p>
              <Link href="/wiki/nueva">
                <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
                  <Plus className="h-4 w-4" />
                  Crear primera nota
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
