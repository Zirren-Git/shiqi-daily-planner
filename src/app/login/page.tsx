'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, Mail, Key, AlertCircle, Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { IS_LOCAL_ONLY } from '@/lib/runtime'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading, isDemoMode, signIn, signUp, enterDemoMode } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (IS_LOCAL_ONLY) {
      router.replace('/schedule')
      return
    }
    if (user) router.push('/calendar')
  }, [user, router])

  const handleLogin = async (data: LoginData) => {
    setError('')
    setSubmitting(true)
    const result = await signIn(data.email, data.password)
    setSubmitting(false)
    if (result.error) setError(result.error)
  }

  const handleRegister = async (data: RegisterData) => {
    setError('')
    setSubmitting(true)
    const result = await signUp(data.email, data.password)
    setSubmitting(false)
    if (result.error) setError(result.error)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* 极浅底纹：用设计系统里的柔光工具类，避免大面积渐变 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 acg-surface opacity-40" />

      <div className="relative w-full max-w-sm space-y-5">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-display">{APP_NAME}</h1>
          <p className="mt-1 text-caption text-muted-foreground">
            {isDemoMode ? 'Local demo mode' : 'Personal planner'}
          </p>
        </div>

        {isDemoMode && (
          <div className="surface-2 flex items-start gap-2 p-3 text-caption text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>Local demo: sign in to start. Your data stays in this browser. Configure Supabase to sync across devices.</span>
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              className="rounded-sm text-caption data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              Sign in
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-sm text-caption data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              Sign up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <section className="surface p-4">
              <div className="mb-4">
                <h2 className="text-section">Sign in</h2>
                <p className="mt-0.5 text-caption text-muted-foreground">Sign in with your email and password</p>
              </div>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-caption text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-caption text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-9 pl-8"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-caption text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-caption text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      className="h-9 pl-8"
                      {...loginForm.register('password')}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-caption text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="h-9 w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign in
                </Button>
              </form>
            </section>
          </TabsContent>

          <TabsContent value="register">
            <section className="surface p-4">
              <div className="mb-4">
                <h2 className="text-section">Sign up</h2>
                <p className="mt-0.5 text-caption text-muted-foreground">Create an account to get started</p>
              </div>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-caption text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-caption text-muted-foreground">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    className="h-9"
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-caption text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-caption text-muted-foreground">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="At least 6 characters"
                    className="h-9"
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-caption text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm" className="text-caption text-muted-foreground">Confirm password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Enter password again"
                    className="h-9"
                    {...registerForm.register('confirmPassword')}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-caption text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" className="h-9 w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign up
                </Button>
              </form>
            </section>
          </TabsContent>
        </Tabs>

        <Button
          type="button"
          data-testid="enter-demo-mode"
          variant="outline"
          className="h-9 w-full"
          onClick={enterDemoMode}
          disabled={submitting}
        >
          Try local demo
        </Button>
      </div>
    </div>
  )
}
