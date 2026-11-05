'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { AppearancePanel } from '@/components/settings/appearance-panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LogOut, Monitor, Bell, BellOff, BellRing, MonitorDown,
  Palette, CalendarDays, Timer, Database, User, Tag
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IS_LOCAL_ONLY, LOCAL_STORAGE_LABEL } from '@/lib/runtime'
import { TagManager } from '@/components/common/tag-manager'
import { BackupPanel } from '@/components/plans/backup-panel'
import { DesktopWidgetControl } from '@/components/layout/desktop-widget-control'
import { ReminderList } from '@/components/reminders/reminder-list'
import { TemplateManager } from '@/components/plans/template-manager'
import { OverdueProcessor } from '@/components/plans/overdue-processor'
import { ImportExportDialog } from '@/components/plans/import-export-dialog'
import { useNotifications } from '@/hooks/use-notifications'
import { usePwa } from '@/components/pwa/pwa-provider'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { useState } from 'react'
import type { CalendarView, WeekStartDay } from '@/types'
import { CALENDAR_VIEW_LABELS, WEEK_START_LABELS } from '@/lib/constants'

type SettingsSection = 'appearance' | 'calendar' | 'focus' | 'notifications' | 'tags' | 'data' | 'account'

const SECTION_ITEMS: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'notifications', label: 'Reminders', icon: Bell },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'account', label: 'Account', icon: User },
]

/** 设置区卡片：统一 surface + text-section 标题 + text-caption 描述 */
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="surface p-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-section">{title}</h2>
          {description && (
            <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** 设置行：点击区高度至少 40 */
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <Label className="text-body font-medium text-foreground">{label}</Label>
        {description && (
          <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, isDemoMode, signOut } = useAuth()
  const { users } = useRepos()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showImportExport, setShowImportExport] = useState(false)
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance')
  const {
    permission,
    requestPermission,
    isSupported: notifSupported,
  } = useNotifications()
  const { isInstallable, promptInstall } = usePwa()

  const { data: prefs } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => users.getPreferences(user!.id),
    enabled: !!user,
  })

  const upsertMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      users.upsertPreferences(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] })
    },
    onError: () => toast.error('Could not save'),
  })

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      const state = await requestPermission()
      if (state === 'denied') {
        toast.error('Notification permission denied. Enable it in browser settings.')
        return
      }
      if (state === 'unsupported') {
        toast.error('Your browser does not support notifications')
        return
      }
      if (state === 'granted') {
        toast.success('Notifications enabled')
      }
    }
    upsertMutation.mutate({ notification_enabled: checked })
  }


  const handleCompactMode = (checked: boolean) => {
    upsertMutation.mutate({ compact_mode: checked })
  }

  const handleDefaultView = (view: string | null) => {
    if (!view) return
    upsertMutation.mutate({ default_calendar_view: view as CalendarView })
  }

  const handleWeekStart = (day: string | null) => {
    if (day === null) return
    upsertMutation.mutate({ week_starts_on: parseInt(day) as WeekStartDay })
  }

  const handleSignOut = async () => {
    await signOut()
    queryClient.clear()
    router.push('/login')
  }

  if (!user) return null

  const notificationEnabled = prefs?.notification_enabled ?? true
  const compactMode = prefs?.compact_mode ?? false
  const defaultView = prefs?.default_calendar_view || 'month'
  const weekStartsOn = prefs?.week_starts_on ?? 0
  const accountLabel = isDemoMode ? 'Local demo mode' : (user.email ?? '')

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Desktop secondary nav */}
      <aside className="hidden w-56 shrink-0 flex-col border-b border-border bg-card/40 lg:flex lg:border-b-0 lg:border-r">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-display">Settings</h1>
          <p className="mt-1 truncate text-caption text-muted-foreground" title={accountLabel}>
            {accountLabel}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          <p className="px-3 pb-1 text-micro text-muted-foreground">Settings sections</p>
          {SECTION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative flex w-full items-center gap-2.5 rounded-md py-2 pl-3 pr-2.5 text-body ui-transition ${
                activeSection === item.id
                  ? 'bg-primary/[0.08] font-medium text-primary'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              }`}
            >
              {activeSection === item.id && (
                <span
                  aria-hidden
                  className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-primary"
                />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile page header */}
      <div className="px-4 pt-6 pb-3 lg:hidden">
        <h1 className="text-display">Settings</h1>
        <p className="mt-1 truncate text-caption text-muted-foreground" title={accountLabel}>
          {accountLabel}
        </p>
      </div>

      {/* Mobile section tabs */}
      {/* 手机上横向滚动会把最后一个分组切掉一半、且没有任何"还有更多"的提示，
          直接换行铺开：多占一行，但七组设置都能看见、都能点到 */}
      <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2 lg:hidden">
        {SECTION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`tap-pad-sm shrink-0 rounded-full px-3 py-2 text-caption ui-transition ${
              activeSection === item.id
                ? 'bg-primary font-medium text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="scroll-thin flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
          {/* PWA Install — always visible at top */}
          {isInstallable && (
            <SectionCard
              icon={MonitorDown}
              title="Install app"
              description="Install the app to your desktop or home screen"
            >
              <Button
                className="h-8"
                onClick={() => { promptInstall(); toast.success('Confirm in the installation prompt') }}
              >
                <MonitorDown className="mr-1.5 h-4 w-4" />Add to home screen
              </Button>
            </SectionCard>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <AppearancePanel />

              <SectionCard icon={Monitor} title="Interface preferences" description="Adjust the density of lists and pages">
                <SettingRow label="Compact mode" description="Use a more compact layout">
                  <Switch checked={compactMode} onCheckedChange={handleCompactMode} />
                </SettingRow>
              </SectionCard>

              {/* 桌面浮窗开关（仅 Electron 打包版显示） */}
              <DesktopWidgetControl variant="card" />
            </div>
          )}

          {/* Calendar */}
          {activeSection === 'calendar' && (
            <SectionCard icon={CalendarDays} title="Calendar preferences" description="Choose a default view and first day of the week">
              <div className="space-y-2">
                <SettingRow label="Default view">
                  <Select value={defaultView} onValueChange={handleDefaultView}>
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue placeholder="Please select">
                        {CALENDAR_VIEW_LABELS[defaultView as CalendarView] || defaultView}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(CALENDAR_VIEW_LABELS) as [CalendarView, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label="First day of the week">
                  <Select value={String(weekStartsOn)} onValueChange={handleWeekStart}>
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue placeholder="Please select">
                        {WEEK_START_LABELS[weekStartsOn as WeekStartDay] || String(weekStartsOn)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(WEEK_START_LABELS) as [string, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingRow>
              </div>
            </SectionCard>
          )}

          {/* Focus */}
          {activeSection === 'focus' && (
            <SectionCard icon={Timer} title="Focus settings" description="Configure your focus timer">
              <p className="text-body text-muted-foreground">
                Focus uses the Pomodoro technique: 25 minutes of focus,
                a 5-minute short break and a 15-minute long break. Adjust these on the Focus page.
              </p>
            </SectionCard>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <SectionCard icon={Bell} title="Browser notifications" description="Manage notifications and reminders">
                <SettingRow
                  label="Notifications"
                  description={
                    !notifSupported
                      ? 'Notifications are not supported here'
                      : permission === 'granted'
                        ? 'Notifications enabled'
                        : permission === 'denied'
                          ? 'Notifications blocked by browser'
                          : 'Click to enable notifications'
                  }
                >
                  {permission === 'granted' ? (
                    <BellRing className="h-4 w-4 text-primary" />
                  ) : permission === 'denied' ? (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={notificationEnabled && permission === 'granted'}
                    onCheckedChange={handleNotificationToggle}
                    disabled={!notifSupported || permission === 'denied'}
                  />
                </SettingRow>
              </SectionCard>

              <section className="surface p-4">
                <ReminderList />
              </section>

              <section className="surface p-4">
                <OverdueProcessor />
              </section>
            </div>
          )}

          {/* Tags */}
          {activeSection === 'tags' && <TagManager />}

          {/* Data */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              <BackupPanel />

              <section className="surface p-4">
                <TemplateManager />
              </section>

              <SectionCard icon={Download} title="Import and export tasks" description="Import or export tasks as CSV or JSON">
                <Button variant="outline" className="h-8" onClick={() => setShowImportExport(true)}>
                  <Download className="mr-1.5 h-4 w-4" />Import / Export
                </Button>
              </SectionCard>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <SectionCard
              icon={User}
              title="Account"
              description={
                IS_LOCAL_ONLY
                  ? `Local mode — data stays in ${LOCAL_STORAGE_LABEL} and is never uploaded`
                  : isDemoMode
                    ? 'Local demo — data stays in this browser'
                    : `Signed in as: ${user.email}`
              }
            >
              {IS_LOCAL_ONLY ? (
                <div className="space-y-3">
                  <p className="text-body text-muted-foreground">
                    Export a JSON backup regularly from Data. Uninstalling the app or clearing its data will erase your records.
                  </p>
                  <Button variant="outline" className="h-8" onClick={() => setActiveSection('data')}>
                    <Database className="mr-1.5 h-4 w-4" />Open data backup
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" className="h-8" onClick={handleSignOut}>
                  <LogOut className="mr-1.5 h-4 w-4" />Sign out
                </Button>
              )}
            </SectionCard>
          )}

          <ImportExportDialog open={showImportExport} onOpenChange={setShowImportExport} />
        </div>
      </div>
    </div>
  )
}
