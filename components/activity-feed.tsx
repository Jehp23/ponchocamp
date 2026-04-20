"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { FileText, MessageSquare, Upload, BookOpen, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Activity {
  id: string
  user_id: string
  action_type: string
  target_type: string | null
  target_id: string | null
  target_title: string | null
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}

const actionConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  create_page: { icon: FileText, color: "bg-emerald-100 text-emerald-600", label: "creo" },
  edit_page: { icon: FileText, color: "bg-blue-100 text-blue-600", label: "edito" },
  comment: { icon: MessageSquare, color: "bg-violet-100 text-violet-600", label: "comento en" },
  upload_file: { icon: Upload, color: "bg-orange-100 text-orange-600", label: "subio" },
  complete_lesson: { icon: BookOpen, color: "bg-pink-100 text-pink-600", label: "completo" },
}

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [limit])

  async function loadActivities() {
    const supabase = createClient()
    const { data } = await supabase
      .from("activity_log")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (data) setActivities(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-lg bg-muted" />
              <div className="h-3 w-1/4 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No hay actividad aun
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = actionConfig[activity.action_type] || { 
          icon: FileText, 
          color: "bg-muted text-muted-foreground", 
          label: activity.action_type 
        }
        const Icon = config.icon

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 group"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-foreground leading-snug">
                <span className="font-semibold">
                  {activity.profiles?.full_name?.split(" ")[0] || "Usuario"}
                </span>{" "}
                <span className="text-muted-foreground">{config.label}</span>{" "}
                {activity.target_id && activity.target_type === "wiki_page" ? (
                  <Link
                    href={`/wiki/${activity.target_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {activity.target_title || "una nota"}
                  </Link>
                ) : (
                  activity.target_title && (
                    <span className="font-medium">{activity.target_title}</span>
                  )
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
