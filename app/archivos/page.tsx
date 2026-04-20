"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Upload, FileText, Film, Image as ImageIcon, FileSpreadsheet, Trash2, Download, Loader2, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR, { mutate } from "swr"

interface FileItem {
  pathname: string
  filename: string
  size: number
  uploadedAt: string
  contentType: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith("video/")) return Film
  if (contentType.startsWith("image/")) return ImageIcon
  if (contentType.includes("spreadsheet") || contentType.includes("excel")) return FileSpreadsheet
  return FileText
}

function getFileColor(contentType: string) {
  if (contentType.startsWith("video/")) return "text-violet-600 bg-violet-100"
  if (contentType.startsWith("image/")) return "text-pink-600 bg-pink-100"
  if (contentType.includes("spreadsheet") || contentType.includes("excel")) return "text-emerald-600 bg-emerald-100"
  if (contentType === "application/pdf") return "text-red-600 bg-red-100"
  return "text-blue-600 bg-blue-100"
}

export default function ArchivosPage() {
  const { data, error, isLoading } = useSWR<{ files: FileItem[] }>("/api/files", fetcher)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const error = await res.json()
          alert(error.error || "Error al subir archivo")
        }
      }
      mutate("/api/files")
    } catch (err) {
      console.error("Upload error:", err)
      alert("Error al subir archivo")
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      handleUpload(e.dataTransfer.files)
    },
    [handleUpload]
  )

  const handleDelete = async (pathname: string) => {
    if (!confirm("Seguro que queres eliminar este archivo?")) return

    try {
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pathname }),
      })

      if (res.ok) {
        mutate("/api/files")
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const files = data?.files || []

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Archivos</h1>
            <p className="text-muted-foreground mt-1">
              Subi y comparte PDFs, videos y documentos con el equipo
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative mb-8 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
              dragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.docx,.doc,.pptx,.ppt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <p className="font-semibold text-lg text-foreground">
                  {uploading ? "Subiendo archivo..." : "Arrastra archivos aqui"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  o hace click para seleccionar
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["PDF", "Video", "Imagen", "Excel", "Word"].map((type) => (
                  <span key={type} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Files List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Archivos subidos
              </h2>
              {files.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {files.length} archivo{files.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-16 rounded-2xl border border-border bg-card">
                <p className="text-muted-foreground">Error al cargar archivos</p>
              </div>
            )}

            {!isLoading && !error && files.length === 0 && (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No hay archivos</p>
                <p className="text-sm text-muted-foreground">
                  Subi tu primer archivo para compartir con el equipo
                </p>
              </div>
            )}

            {files.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                {files.map((file) => {
                  const Icon = getFileIcon(file.contentType)
                  const colorClass = getFileColor(file.contentType)
                  return (
                    <div
                      key={file.pathname}
                      className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {file.filename}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short"
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          asChild
                        >
                          <a
                            href={`/api/file?pathname=${encodeURIComponent(file.pathname)}`}
                            download={file.filename}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(file.pathname)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
