import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { ActivityFeed } from "@/components/activity-feed"
import { createClient } from "@/lib/supabase/server"
import { FileText, ArrowRight, Clock, User, Upload, Sparkles } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  
  const { data: recentPages } = await supabase
    .from("wiki_pages")
    .select("id, title, emoji, created_at, profiles(full_name)")
    .order("updated_at", { ascending: false })
    .limit(5)

  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "equipo"

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Welcome Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Bienvenido de vuelta
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              Hola, {firstName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu espacio para compartir y aprender con el equipo.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <Link
              href="/wiki/nueva"
              className="group relative overflow-hidden flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Nueva nota</p>
                <p className="text-sm text-primary-foreground/80">
                  Documenta algo para el equipo
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
            </Link>
            <Link
              href="/archivos"
              className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  Subir archivo
                </p>
                <p className="text-sm text-muted-foreground">
                  PDFs, videos, documentos
                </p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Wiki Pages - Takes 2 columns */}
            <section className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Notas recientes
                </h2>
                <Link
                  href="/wiki"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {recentPages && recentPages.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentPages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/wiki/${page.id}`}
                        className="group flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl">
                          {page.emoji || "📄"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {page.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {(page.profiles as { full_name: string } | null)?.full_name || "Equipo"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(page.created_at).toLocaleDateString("es-AR", { 
                                day: "numeric",
                                month: "short"
                              })}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Aun no hay notas</p>
                    <p className="text-sm">Crea la primera nota para el equipo</p>
                  </div>
                )}
              </div>
            </section>

            {/* Activity Feed - Takes 1 column */}
            <section className="col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Actividad
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 h-[calc(100%-2.5rem)]">
                <ActivityFeed limit={6} />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
