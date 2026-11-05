'use client'

// ============================================================
// Smart colors面板
//
// 四个模式：
// - theme     跟随主题（不动任何变量）
// - wallpaper 从背景提取主色，生成整套调色板
// - accent    用你选的强调色推导背景氛围/卡片/边框
// - locked    锁住背景原图，只调 UI，并在冲突时给提示
//
// Color coordination只缩放"叠加层"（氛围光/蒙层/卡片/边框），
// 背景图与Character图本身永远不会被染色。
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Check,
  Contrast,
  Droplet,
  Palette,
  Pipette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useAppearance } from '@/providers/appearance-provider'
import { buildPalette, contrastRatio, hueClash, paletteSwatches } from '@/lib/theme/color'
import { getAssetUrl } from '@/lib/atmosphere/custom-assets'
import { palettesFromImageUrl } from '@/lib/theme/palette-from-image'
import { getScene } from '@/lib/theme/atmosphere'
import { useCurrentScene } from '@/components/atmosphere/use-current-scene'
import type { ColorMode, ColorSettings } from '@/lib/theme/types'

const MODES: { value: ColorMode; label: string; hint: string; icon: typeof Palette }[] = [
  {
    value: 'theme',
    label: 'Theme default',
    hint: "Use the theme's original colors",
    icon: Palette,
  },
  {
    value: 'wallpaper',
    label: 'Colors from background',
    hint: 'Generate coordinated colors from your background',
    icon: Pipette,
  },
  {
    value: 'accent',
    label: 'Linked accent colors',
    hint: 'Update background, cards and borders when the accent changes',
    icon: Droplet,
  },
  {
    value: 'locked',
    label: 'Lock background',
    hint: 'Keep the background image unchanged and adjust the interface',
    icon: ShieldCheck,
  },
]

const PRESETS = ['#db2777', '#2563eb', '#7c3aed', '#059669', '#ea580c', '#0891b2', '#b45309', '#475569']

export function ColorPanel() {
  const { state, theme, patchColor, applySeed, setColorStrength, resetColor } = useAppearance()
  const color = state.color
  const scene = useCurrentScene()
  const snapshot = useRef<ColorSettings>(color)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  // 进入面板时留一份快照，供"撤销"使用
  useEffect(() => {
    snapshot.current = color
    // 只在首次挂载时记录，之后由用户显式撤销
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const palette = color.palette
  const seed = color.seed ?? (palette ? palette.seed : null)

  const customUrl = useRef<string | null>(null)

  const pickFromBackground = useCallback(async () => {
    setBusy(true)
    setNote(null)
    try {
      if (state.atmosphere.bgSource === 'custom' && state.atmosphere.customBackgroundId) {
        const url = customUrl.current ?? (await getAssetUrl(state.atmosphere.customBackgroundId))
        customUrl.current = url
        if (!url) {
          setNote('The custom background has not loaded. Try again later.')
          return
        }
        const results = await palettesFromImageUrl(url, { strength: color.strength })
        if (results.length === 0) {
          setNote('Could not extract colors from this image. Try another.')
          return
        }
        const best = results[0]
        patchColor({
          mode: 'wallpaper',
          seed: best.seed,
          palette: best,
          candidates: results.map((r) => r.seed),
          lockedSeed: results[0].seed,
        })
        setNote(`Extracted ${results.length} color palettes from the wallpaper`)
      } else {
        // 内置Scenes：用Scenes自带的主色调作为种子（比把 SVG 栅格化更稳、也更快）
        const tint = scene ? getScene(scene.id)?.tint : null
        if (!tint) {
          setNote('No background available for analysis')
          return
        }
        const built = buildPalette(tint, color.strength, state.mode === 'dark')
        patchColor({
          mode: 'wallpaper',
          seed: built.seed,
          palette: built,
          candidates: [built.seed],
          lockedSeed: built.seed,
        })
        setNote('Colors extracted from the current scene')
      }
    } finally {
      setBusy(false)
    }
  }, [
    color.strength,
    patchColor,
    scene,
    state.atmosphere.bgSource,
    state.atmosphere.customBackgroundId,
    state.mode,
  ])

  const clash =
    color.mode === 'locked' && color.lockedSeed && palette
      ? hueClash(color.lockedSeed, palette.primary)
      : null

  const readable = palette ? contrastRatio(palette.onPrimary, palette.primary) : null

  return (
    <section className="surface p-4" data-testid="color-panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Palette className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-section text-foreground">Smart colors</h2>
            <p className="mt-0.5 text-caption text-muted-foreground">
              Coordinate accents, backgrounds, cards and borders
            </p>
          </div>
        </div>
        <span className="shrink-0 text-micro text-muted-foreground">{theme.name}</span>
      </div>

      {/* 模式 */}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
        {MODES.map((mode) => {
          const active = color.mode === mode.value
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => {
                if (mode.value === 'theme') resetColor()
                else patchColor({ mode: mode.value })
              }}
              aria-pressed={active}
              data-testid={`color-mode-${mode.value}`}
              className={cn(
                'atmo-thumb flex flex-col gap-1 border p-2 text-left ui-transition',
                active
                  ? 'border-primary/60 bg-primary/[0.06]'
                  : 'border-border hover:bg-accent/60'
              )}
            >
              <span className="flex items-center gap-1.5 text-caption font-medium text-foreground">
                <mode.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {mode.label}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">{mode.hint}</span>
            </button>
          )
        })}
      </div>

      {/* 取色与种子色 */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            disabled={busy}
            onClick={() => void pickFromBackground()}
            data-testid="color-pick"
          >
            <Pipette className="h-3.5 w-3.5" />
            {busy ? 'Analyzing…' : 'Extract colors from background'}
          </Button>
          <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-caption text-muted-foreground ui-transition hover:text-foreground">
            Custom primary color
            <input
              type="color"
              value={seed ?? '#7c3aed'}
              onChange={(e) => applySeed(e.target.value, 'accent')}
              className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
              aria-label="Custom primary color"
            />
          </label>
          {PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Primary color ${hex}`}
              onClick={() => applySeed(hex, 'accent')}
              className={cn(
                'h-7 w-7 rounded-full border-2 ui-transition',
                seed === hex ? 'border-foreground' : 'border-transparent'
              )}
              style={{ backgroundColor: hex }}
            >
              {seed === hex && <Check className="mx-auto h-3.5 w-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>

        {(color.candidates.length > 1 || (palette && color.mode === 'wallpaper')) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-micro text-muted-foreground">Suggested colors</span>
            {color.candidates.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => applySeed(hex, 'wallpaper')}
                aria-label={`Suggested color ${hex}`}
                className="h-5 w-5 rounded-full border border-border ui-transition hover:scale-110"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}
        {note && <p className="mt-2 text-micro text-muted-foreground">{note}</p>}
      </div>

      {/* 强度 */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <Label className="w-16 shrink-0 text-caption text-muted-foreground">Color coordination</Label>
          <Slider
            value={[color.strength]}
            onValueChange={(v) => setColorStrength((v as number[])[0])}
            min={0}
            max={100}
            step={5}
            className="flex-1"
            aria-label="Color coordination"
          />
          <span className="w-11 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
            {color.strength}%
          </span>
        </div>
        <p className="mt-1 text-micro text-muted-foreground">
          0% changes only button colors; 100% coordinates backgrounds, overlays and cards. Images remain unchanged.
        </p>
      </div>

      {/* 调色板 */}
      {palette && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-caption text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Current palette
          </p>
          <div className="flex flex-wrap gap-2">
            {paletteSwatches(palette).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span
                  className="h-6 w-6 rounded-md border border-border"
                  style={{ backgroundColor: s.value }}
                />
                <span className="text-micro text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* 实时预览：按钮 + 卡片 + 边框 */}
          <div
            className="mt-2 flex items-center gap-3 rounded-md border p-3"
            style={{
              borderColor: palette.borderTint,
              backgroundImage: `linear-gradient(180deg, ${palette.cardTint}, transparent 70%)`,
            }}
          >
            <span
              className="rounded-md px-3 py-1.5 text-caption font-medium"
              style={{ backgroundColor: palette.primary, color: palette.onPrimary }}
            >
              Primary action
            </span>
            <span
              className="rounded-md px-3 py-1.5 text-caption"
              style={{ backgroundColor: palette.primaryContainer, color: palette.primary }}
            >
              Secondary action
            </span>
            <span className="text-micro text-muted-foreground">
              Text contrast: {readable ? readable.toFixed(1) : '—'}:1
            </span>
          </div>

          {clash !== null && (
            <p
              className={cn(
                'mt-2 flex items-center gap-1.5 text-micro',
                clash > 0.55 ? 'text-warning' : 'text-muted-foreground'
              )}
            >
              <Contrast className="h-3 w-3" aria-hidden="true" />
              {clash > 0.55
                ? `The primary color clashes with the background (${Math.round(clash * 100)}%). Try a suggested color or lower the coordination.`
                : `Color coordination is acceptable (${Math.round(clash * 100)}% clash)`}
            </p>
          )}
        </div>
      )}

      {/* 操作 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1"
          onClick={() => patchColor({ ...snapshot.current })}
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo changes
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={resetColor}>
          <RotateCcw className="h-3.5 w-3.5" />
          Restore default theme colors
        </Button>
        <span className="text-micro text-muted-foreground">
          Color settings are saved with your appearance preferences
        </span>
      </div>
    </section>
  )
}
