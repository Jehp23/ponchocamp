"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/components/user-provider"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  itemId: string
  itemType: "wiki_page" | "course" | "file"
  className?: string
}

export function FavoriteButton({ itemId, itemType, className }: FavoriteButtonProps) {
  const { user } = useUser()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkFavorite() {
      if (!user) return

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .single()

      setIsFavorite(!!data)
    }

    checkFavorite()
  }, [user, itemId, itemType, supabase])

  const toggleFavorite = async () => {
    if (!user) return

    setLoading(true)

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
      setIsFavorite(false)
    } else {
      await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
        })
      setIsFavorite(true)
    }

    setLoading(false)
  }

  if (!user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={cn("h-8 w-8", className)}
    >
      <Star 
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
        )} 
      />
    </Button>
  )
}
