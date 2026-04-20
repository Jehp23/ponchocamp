'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Image
              src="/logo.png"
              alt="PonchoCamp"
              width={56}
              height={56}
              className="rounded-xl shadow-lg mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground mt-2">Ingresa a tu cuenta de PonchoCamp</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ponchocapital.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contrasena
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-4 rounded-xl">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 text-base font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            No tenes cuenta?{' '}
            <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <Image
            src="/logo.png"
            alt="PonchoCamp"
            width={100}
            height={100}
            className="mx-auto mb-8 rounded-2xl shadow-2xl"
          />
          <h2 className="text-4xl font-bold mb-4 tracking-tight">PonchoCamp</h2>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            El espacio de aprendizaje y colaboracion del equipo de PonchoCapital
          </p>
        </div>
      </div>
    </div>
  )
}
