import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Revisá tu email</h1>
        <p className="text-muted-foreground mb-8">
          Te enviamos un link de confirmación. Hacé click en el link para activar tu cuenta.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Volver al login</Link>
        </Button>
      </div>
    </div>
  )
}
