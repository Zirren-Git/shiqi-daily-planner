'use client'

// ============================================================
// Immersive mode ↔ 纯净工作模式 的快捷开关
//
// 放在侧栏底部：一键在"有Character有背景"和"最大化工作区"之间切换。
// 只改氛围参数，不动主题配色，所以切回来时视觉身份不丢。
// ============================================================

import { Sparkles, Square } from 'lucide-react'
import { useAppearance } from '@/providers/appearance-provider'
import { cn } from '@/lib/utils'

export function ImmersiveToggle({ compact = false }: { compact?: boolean }) {
  const { state, patchAtmosphere } = useAppearance()
  const immersive = state.atmosphere.mode === 'immersive'

  const toggle = () => {
    patchAtmosphere({
      mode: immersive ? 'pure' : 'immersive',
      // 从纯净切回沉浸时，把总开关一并恢复，避免"点了没反应"
      enabled: immersive ? state.atmosphere.enabled : true,
    })
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        title={immersive ? 'Switch to distraction-free mode' : 'Switch to immersive mode'}
        aria-label={immersive ? 'Switch to distraction-free mode' : 'Switch to immersive mode'}
        aria-pressed={!immersive}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground ui-transition hover:bg-accent hover:text-foreground"
      >
        {immersive ? <Sparkles className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!immersive}
      data-testid="immersive-toggle"
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-caption ui-transition',
        'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
      title={immersive ? 'Switch to distraction-free mode (hide character and background)' : 'Switch to immersive mode (show character and background)'}
    >
      {immersive ? (
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Square className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span className="truncate">{immersive ? 'Immersive mode' : 'Distraction-free mode'}</span>
      <span
        className={cn(
          'ml-auto flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 ui-transition',
          immersive ? 'bg-primary/80' : 'bg-muted'
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            'h-3 w-3 rounded-full bg-white shadow-sm transition-transform',
            immersive ? 'translate-x-3' : 'translate-x-0'
          )}
        />
      </span>
    </button>
  )
}
