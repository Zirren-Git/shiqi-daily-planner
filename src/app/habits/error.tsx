'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

export default function HabitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error('[HabitsPage] Unhandled error:', error)
    console.error('[HabitsPage] Error name:', error?.name)
    console.error('[HabitsPage] Error message:', error?.message)
    console.error('[HabitsPage] Error stack:', error?.stack)
  }, [error])

  const errorName = error?.name || 'Error'
  const errorMessage = error?.message || 'Unknown error'
  const errorStack = error?.stack || ''

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habit tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Keep it up every day</p>
      </div>

      <Card className="border-destructive/30">
        <CardContent className="py-6 space-y-4">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive/60 mx-auto" />
            <p className="text-sm font-medium mt-3">Could not load this page</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try refreshing the page or checking your connection
            </p>
          </div>

          {/* Error details — diagnostic info */}
          <div className="bg-destructive/5 rounded-lg p-3 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs font-medium text-destructive/80 hover:text-destructive w-full"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Error details
            </button>
            {showDetails && (
              <div className="mt-2 space-y-1 text-xs font-mono text-muted-foreground break-all">
                <p><span className="font-semibold">Name:</span> {errorName}</p>
                <p><span className="font-semibold">Message:</span> {errorMessage}</p>
                {error.digest && (
                  <p><span className="font-semibold">Digest:</span> {error.digest}</p>
                )}
                {errorStack && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[10px] text-muted-foreground/60">
                      Stack trace
                    </summary>
                    <pre className="mt-1 text-[10px] whitespace-pre-wrap text-muted-foreground/60 max-h-40 overflow-auto">
                      {errorStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh page
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={reset}
              className="gap-1.5"
            >
              Retry
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/50 text-center">
            Open browser developer tools (F12) and share the full error from the Console
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
