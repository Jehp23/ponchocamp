import Link from "next/link"
import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Clock, User, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
import { Comments } from "@/components/comments"
import ReactMarkdown from "react-markdown"

export default async function WikiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from("wiki_pages")
    .select(`
      *,
      profiles(full_name),
      wiki_page_tags(
        tags(id, name, color)
      )
    `)
    .eq("id", id)
    .single()

  if (!page) {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-60">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/wiki"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Wiki
            </Link>
            <div className="flex items-center gap-2">
              <FavoriteButton itemId={page.id} itemType="wiki_page" />
              <Link href={`/wiki/${page.id}/editar`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{page.emoji || "📄"}</span>
              <h1 className="text-3xl font-bold text-foreground text-balance">
                {page.title}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {(page.profiles as { full_name: string } | null)?.full_name || "Equipo"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(page.updated_at).toLocaleDateString("es-AR")}
              </span>
            </div>

            {/* Tags */}
            {page.wiki_page_tags && page.wiki_page_tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {page.wiki_page_tags.map((wpt: { tags: { id: string; name: string; color: string } | null }) =>
                  wpt.tags && (
                    <span
                      key={wpt.tags.id}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${wpt.tags.color}20`, color: wpt.tags.color }}
                    >
                      {wpt.tags.name}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <article className="prose prose-neutral max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-foreground mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">
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
                li: ({ children }) => (
                  <li className="text-foreground">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-8 border-border" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-4 py-2 text-left font-medium text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2 text-foreground">
                    {children}
                  </td>
                ),
              }}
            >
              {page.content || "*Esta nota esta vacia*"}
            </ReactMarkdown>
          </article>

          {/* Comments */}
          <div className="mt-12 pt-8 border-t border-border">
            <Comments pageId={page.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
