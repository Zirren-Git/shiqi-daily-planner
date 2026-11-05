'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getDesktopBridge, type DesktopBridge } from '@/lib/desktop-bridge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { MonitorSmartphone, Pin, PinOff, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PetPreferencesControl } from './pet-preferences'
import { toast } from 'sonner'

/** bridge 是外部注入的，用 useSyncExternalStore 读取可以避免 SSR 水合不一致 */
const subscribeNoop = () => () => {}
const getBridgeSnapshot = () => getDesktopBridge()
const getServerSnapshot = () => null

/**
 * 「Desktop widget」开关。只在 Electron 打包版里出现（网页/安卓没有 desktop bridge）。
 * variant='sidebar' 放在侧边栏底部，variant='card' 放在设置页。
 */
export function DesktopWidgetControl({ variant = 'sidebar' }: { variant?: 'sidebar' | 'card' }) {
  const bridge = useSyncExternalStore<DesktopBridge | null>(
    subscribeNoop,
    getBridgeSnapshot,
    getServerSnapshot
  )
  const [visible, setVisible] = useState(false)
  const [pinned, setPinned] = useState(true)
  const [dockEnabled, setDockEnabled] = useState(false)
  const [petEnabled, setPetEnabled] = useState(false)

  useEffect(() => {
    if (!bridge) return
    let cancelled = false
    bridge
      .isWidgetVisible()
      .then((value) => {
        if (!cancelled) setVisible(value)
      })
      .catch(() => {})
    bridge
      .isPinned()
      .then((value) => {
        if (!cancelled) setPinned(value)
      })
      .catch(() => {})
    bridge
      .getDockState()
      .then((state) => {
        if (!cancelled) setDockEnabled(state.enabled)
      })
      .catch(() => {})
    bridge
      .isPetEnabled()
      .then((value) => {
        if (!cancelled) setPetEnabled(value)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [bridge])

  const toggleVisible = useCallback(async () => {
    if (!bridge) return
    const next = await bridge.toggleWidget()
    setVisible(next)
    toast.success(next ? 'Widget shown' : 'Widget hidden', { duration: 1500 })
  }, [bridge])

  const togglePin = useCallback(async () => {
    if (!bridge) return
    setPinned(await bridge.togglePin())
  }, [bridge])

  const toggleDock = useCallback(
    async (next: boolean) => {
      if (!bridge) return
      setDockEnabled(next)
      try {
        const state = await bridge.setDockEnabled(next)
        setDockEnabled(state.enabled)
        toast.success(next ? 'Edge docking enabled. Drag the widget to a screen edge.' : 'Edge docking disabled', { duration: 2200 })
      } catch {
        setDockEnabled(!next)
      }
    },
    [bridge]
  )

  const togglePet = useCallback(
    async (next: boolean) => {
      if (!bridge) return
      setPetEnabled(next)
      try {
        setPetEnabled(await bridge.setPetEnabled(next))
        if (next) toast.success('Pet opened. Click to talk, drag to move, right-click to change appearance.', { duration: 2500 })
      } catch {
        setPetEnabled(!next)
      }
    },
    [bridge]
  )

  if (!bridge) return null

  if (variant === 'card') {
    return (
      <section className="surface p-4" data-testid="desktop-widget-card">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <MonitorSmartphone className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-section">Desktop widget and pet</h2>
            <p className="mt-0.5 text-caption text-muted-foreground">
              A small desktop checklist for quick tasks, or turn it into a desktop pet.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={visible ? 'outline' : 'default'} className="h-8" onClick={toggleVisible}>
            {visible ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
            {visible ? 'Hide widget' : 'Show widget'}
          </Button>
          <Button variant="outline" className="h-8" onClick={togglePin}>
            {pinned ? <PinOff className="mr-1.5 h-4 w-4" /> : <Pin className="mr-1.5 h-4 w-4" />}
            {pinned ? 'Unpin' : 'Pin widget'}
          </Button>
        </div>

        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <label className="flex cursor-pointer items-start gap-3" data-testid="dock-toggle-row">
            <Switch checked={dockEnabled} onCheckedChange={toggleDock} className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block text-body text-foreground">Dock at screen edge</span>
              <span className="mt-0.5 block text-caption text-muted-foreground">
                Drag the widget to a screen edge to dock it; hover to bring it back.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3" data-testid="pet-toggle-row">
            <Switch checked={petEnabled} onCheckedChange={togglePet} className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block text-body text-foreground">Desktop pet mode</span>
              <span className="mt-0.5 block text-caption text-muted-foreground">
                Click to talk, drag to move, or right-click to change appearance. Use Settings below the pet to manage it.
              </span>
            </span>
          </label>
          <PetPreferencesControl />
        </div>
      </section>
    )
  }

  return (
    <button
      type="button"
      data-testid="sidebar-widget-toggle"
      onClick={toggleVisible}
      title={visible ? 'Hide desktop widget' : 'Show desktop widget'}
      className={`relative flex w-full items-center gap-3 rounded-md py-2 pl-3 pr-2.5 text-body ui-transition ${
        visible
          ? 'bg-primary/[0.08] font-medium text-primary'
          : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
      }`}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-full bg-primary transition-opacity duration-[var(--motion-fast)]',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      />
      <MonitorSmartphone className="h-4 w-4 shrink-0" />
      <span className="truncate">Desktop widget</span>
      <span
        className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-micro ${
          visible ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground'
        }`}
      >
        {visible ? 'Visible' : 'Hidden'}
      </span>
    </button>
  )
}
