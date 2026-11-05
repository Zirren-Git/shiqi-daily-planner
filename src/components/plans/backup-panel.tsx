'use client'

import { useRef, useState, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Download, Upload, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { todayStr, format } from '@/lib/utils/date'
import {
  createBackup,
  countBackup,
  parseBackup,
  restoreBackup,
  type BackupPayload,
  type BackupStats,
} from '@/lib/sync/backup'

function statsLines(stats: BackupStats): { label: string; value: number }[] {
  return [
    { label: 'Tasks', value: stats.tasks },
    { label: 'Tags', value: stats.tags },
    { label: 'Habits', value: stats.habits },
    { label: 'Check-ins', value: stats.habit_logs },
    { label: 'Daily rating', value: stats.reviews },
    { label: 'Countdowns', value: stats.countdowns },
    { label: 'Templates', value: stats.templates },
    { label: 'Focus sessions', value: stats.focus_sessions },
  ]
}

/**
 * 完整备份 / 恢复：把当前账号的全部数据导出成一个 JSON，
 * 换设备（Win ↔ 安卓）或重装前用它搬数据。
 */
export function BackupPanel() {
  const { user } = useAuth()
  const repos = useRepos()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [pending, setPending] = useState<BackupPayload | null>(null)

  const handleExport = useCallback(async () => {
    if (!user || exporting) return
    setExporting(true)
    try {
      const payload = await createBackup(repos, user.id)
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shiqi-backup-${todayStr()}-${format(new Date(), 'HHmm')}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      const stats = countBackup(payload)
      toast.success(`Backup exported (${stats.tasks} tasks / ${stats.habits} habits)`)
    } catch {
      toast.error('Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }, [user, repos, exporting])

  const handlePickFile = useCallback(() => {
    fileRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      try {
        const text = await file.text()
        const payload = parseBackup(JSON.parse(text))
        setPending(payload)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not read file'
        toast.error(`Invalid backup: ${message}`)
      }
    },
    []
  )

  const handleConfirmRestore = useCallback(async () => {
    if (!user || !pending || restoring) return
    setRestoring(true)
    try {
      const result = await restoreBackup(repos, user.id, pending)
      queryClient.invalidateQueries()
      const total = Object.values(result.restored).reduce((a, b) => a + b, 0)
      if (result.skipped > 0) {
        toast.warning(`Restored ${total} records; skipped ${result.skipped}`)
      } else {
        toast.success(`Restored ${total} records`)
      }
      setPending(null)
    } catch {
      toast.error('Restore failed. Try again.')
    } finally {
      setRestoring(false)
    }
  }, [user, pending, restoring, repos, queryClient])

  const pendingStats = pending ? countBackup(pending) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-section">Full backup</CardTitle>
        <CardDescription className="text-caption text-muted-foreground">
          Export all your data as JSON before switching devices or reinstalling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={exporting} data-testid="backup-export">
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export full backup
          </Button>
          <Button
            variant="outline"
            onClick={handlePickFile}
            disabled={restoring}
            data-testid="backup-import"
          >
            <Upload className="h-4 w-4 mr-2" />
            Restore backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="flex items-start gap-1.5 text-caption text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Restoring adds records without replacing existing ones; reviews with the same date are updated.
        </p>
      </CardContent>

      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section">Restore this backup?</DialogTitle>
            <DialogDescription className="text-caption text-muted-foreground">
              {pending?.exported_at
                ? `Backup date: ${format(new Date(pending.exported_at), 'MMM d, yyyy HH:mm')}`
                : 'The backup has no export date'}
            </DialogDescription>
          </DialogHeader>

          {pendingStats && (
            <div className="grid grid-cols-2 gap-2">
              {statsLines(pendingStats).map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2"
                >
                  <span className="text-caption text-muted-foreground">{row.label}</span>
                  <span className="text-body tabular-nums font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          <p className="flex items-start gap-1.5 text-caption text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
            Export your current data first to avoid duplicate records.
          </p>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setPending(null)} disabled={restoring}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRestore} disabled={restoring} data-testid="backup-restore-confirm">
              {restoring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Restore
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
