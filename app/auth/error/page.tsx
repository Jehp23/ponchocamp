import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Error de autenticación</h1>
        <p className="text-muted-foreground mb-8">
          Hubo un problema al verificar tu cuenta. Por favor intentá de nuevo.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Volver al login</Link>
        </Button>
      </div>
    </div>
  )
}
