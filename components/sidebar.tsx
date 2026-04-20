"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  FileText, 
  FolderOpen,
  Plus,
  Search,
  LogOut,
  Star,
  Sparkles
} from "lucide-react"
import { useUser } from "@/components/user-provider"
import { SearchDialog } from "@/components/search-dialog"
import { signout } from "@/app/auth/actions"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Notas", href: "/wiki", icon: FileText },
  { name: "Archivos", href: "/archivos", icon: FolderOpen },
  { name: "Favoritos", href: "/favoritos", icon: Star },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-lg text-foreground tracking-tight">PonchoCamp</span>
          <p className="text-xs text-muted-foreground">by PonchoCapital</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <button 
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-all duration-200"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded-md border border-border">
            Cmd K
          </kbd>
        </button>
      </div>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        {/* Nueva nota */}
        <div className="pt-6">
          <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Acciones
          </p>
          <Link
            href="/wiki/nueva"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Nueva nota
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4">
        {loading ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">Cargando...</div>
        ) : user ? (
          <div className="rounded-xl bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-sm">
                {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.user_metadata?.full_name || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <form action={signout}>
              <button 
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesion
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200"
          >
            Iniciar sesion
          </Link>
        )}
      </div>
    </aside>
  )
}
