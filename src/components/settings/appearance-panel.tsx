'use client'

import { useRef, useState, type ComponentType, type ReactNode } from 'react'
import {
  Check,
  Download,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Wand2,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAppearance } from '@/providers/appearance-provider'
import {
  FONT_OPTIONS,
  MOTION_OPTIONS,
  SCALE_OPTIONS,
  THEMES,
  getTheme,
} from '@/lib/theme/themes'
import type { ThemeId } from '@/lib/theme/types'
import { ThemeCard } from './theme-card'
import { AtmospherePanel } from './atmosphere-panel'
import { CharacterLibraryPanel } from './character-library-panel'
import { ColorPanel } from './color-panel'

/** 常用强调色预设 */
const ACCENT_PRESETS = [
  '#0067c0',
  '#7c3aed',
  '#f472b6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#17171a',
]

function Panel({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-section text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap items-center gap-0.5 rounded-full bg-surface-2 p-0.5"
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-7 rounded-full px-3 text-caption ui-transition',
            value === opt.value
              ? 'bg-primary/12 font-medium text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function RadiusRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-16 shrink-0 text-caption text-muted-foreground">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange((v as number[])[0])}
        min={0}
        max={32}
        step={1}
        className="flex-1"
        aria-label={`${label}corner radius`}
      />
      <span className="w-10 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
        {value}px
      </span>
    </div>
  )
}

export function AppearancePanel() {
  const {
    theme,
    mode,
    state,
    personalization: p,
    isCustomized,
    presets,
    setThemeId,
    setMode,
    setFollowSystem,
    patchPersonalization,
    resetCurrentTheme,
    resetAll,
    savePreset,
    applyPreset,
    renamePreset,
    deletePreset,
    exportJson,
    importJson,
  } = useAppearance()

  const [presetName, setPresetName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmAction, setConfirmAction] = useState<'current' | 'all' | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importOk, setImportOk] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const modeSupported = theme.modes.length > 1

  function handleExport() {
    const json = exportJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 用本地日期命名：toISOString 是 UTC，北京凌晨会落到前一天
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`
    a.download = `timegrid-appearance-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importJson(String(reader.result ?? ''))
      if (result.ok) {
        setImportError(null)
        setImportOk(true)
        window.setTimeout(() => setImportOk(false), 2500)
      } else {
        setImportOk(false)
        setImportError(result.error ?? 'Import failed')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      {/* 主题 */}
      <Panel
        icon={Palette}
        title="Theme"
        description="Each theme has its own colors, fonts, borders and decorations. Changes are saved automatically."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {THEMES.map((def) => (
            <ThemeCard
              key={def.id}
              def={def}
              active={state.themeId === def.id}
              onSelect={() => setThemeId(def.id as ThemeId)}
            />
          ))}
        </div>
        <p className="mt-3 text-micro text-muted-foreground">
          {theme.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {theme.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full bg-surface-2 px-2 py-0.5 text-micro text-muted-foreground"
            >
              {k}
            </span>
          ))}
        </div>
      </Panel>

      {/* 明暗 */}
      <Panel
        icon={mode === 'dark' ? Moon : Sun}
        title="Light / dark mode"
        description={
          modeSupported
            ? 'Both light and dark modes have their own tuned colors'
            : `${theme.name} This theme is designed for ${theme.defaultMode === 'dark' ? 'Dark' : 'Light'} mode and cannot switch modes`
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={!state.followSystem && state.mode === 'light' ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5"
            disabled={!modeSupported}
            onClick={() => setMode('light')}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </Button>
          <Button
            variant={!state.followSystem && state.mode === 'dark' ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5"
            disabled={!modeSupported}
            onClick={() => setMode('dark')}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </Button>
          <Button
            variant={state.followSystem ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5"
            disabled={!modeSupported}
            onClick={() => setFollowSystem(true)}
          >
            <Monitor className="h-3.5 w-3.5" />
            Follow system
          </Button>
          {state.followSystem && modeSupported && (
            <span className="text-micro text-muted-foreground">
              System appearance: {mode === 'dark' ? 'Dark' : 'Light'}
            </span>
          )}
        </div>
      </Panel>

      {/* 强调色 */}
      <Panel
        icon={Wand2}
        title="Accent color"
        description="Override the accent color without changing the theme. Text contrast adjusts automatically."
        action={
          p.accent ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-caption text-muted-foreground"
              onClick={() => patchPersonalization({ accent: null })}
            >
              Use theme color
            </Button>
          ) : (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-micro text-muted-foreground">
              Follow theme
            </span>
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => patchPersonalization({ accent: null })}
            aria-label="Use the theme accent color"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 ui-transition',
              p.accent ? 'border-border' : 'border-primary'
            )}
            style={{ backgroundColor: theme.preview[theme.defaultMode].accent }}
          >
            {!p.accent && <Check className="h-4 w-4 text-white drop-shadow" />}
          </button>
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Accent color ${color}`}
              onClick={() => patchPersonalization({ accent: color })}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 ui-transition',
                p.accent === color ? 'border-foreground' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            >
              {p.accent === color && <Check className="h-4 w-4 text-white drop-shadow" />}
            </button>
          ))}
          <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 text-caption text-muted-foreground ui-transition hover:text-foreground">
            Custom
            <input
              type="color"
              value={p.accent ?? theme.preview[theme.defaultMode].accent}
              onChange={(e) => patchPersonalization({ accent: e.target.value })}
              className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
              aria-label="Custom accent color"
            />
          </label>
        </div>
      </Panel>

      {/* 圆角 */}
      <Panel
        icon={SlidersHorizontal}
        title="Corner radius"
        description="Adjust buttons, cards, inputs and dialogs separately."
        action={
          <span className="text-micro tabular-nums text-muted-foreground">
            {p.radius.button}/{p.radius.card}/{p.radius.input}/{p.radius.dialog} px
          </span>
        }
      >
        <div className="space-y-2.5">
          <RadiusRow
            label="Buttons"
            value={p.radius.button}
            onChange={(v) => patchPersonalization({ radius: { ...p.radius, button: v } })}
          />
          <RadiusRow
            label="Cards"
            value={p.radius.card}
            onChange={(v) => patchPersonalization({ radius: { ...p.radius, card: v } })}
          />
          <RadiusRow
            label="Inputs"
            value={p.radius.input}
            onChange={(v) => patchPersonalization({ radius: { ...p.radius, input: v } })}
          />
          <RadiusRow
            label="Dialogs"
            value={p.radius.dialog}
            onChange={(v) => patchPersonalization({ radius: { ...p.radius, dialog: v } })}
          />
        </div>
      </Panel>

      {/* 缩放 + 字体 + 动效 */}
      <Panel
        icon={Type}
        title="Font and scale"
        description="Scale the interface without blurring it. Unavailable fonts fall back automatically."
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-caption text-muted-foreground"
            onClick={() =>
              patchPersonalization({
                fontId: theme.defaults.fontId,
                typeScale: theme.defaults.typeScale,
                titleScale: theme.defaults.titleScale,
                scale: theme.defaults.scale,
              })
            }
          >
            <RotateCcw className="h-3 w-3" />
            Restore
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-caption text-muted-foreground">Interface scale</Label>
            <Segmented
              label="Interface scale"
              value={p.scale}
              options={SCALE_OPTIONS.map((s) => ({ value: s, label: `${Math.round(s * 100)}%` }))}
              onChange={(v) => patchPersonalization({ scale: v })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-caption text-muted-foreground">Font</Label>
            <select
              value={p.fontId}
              onChange={(e) =>
                patchPersonalization({
                  fontId: e.target.value as (typeof p)['fontId'],
                })
              }
              className="h-8 min-w-40 rounded-md border border-input bg-background px-2 text-caption"
              aria-label="Font"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-16 shrink-0 text-caption text-muted-foreground">Body font size</Label>
            <Slider
              value={[Math.round(p.typeScale * 100)]}
              onValueChange={(v) => patchPersonalization({ typeScale: (v as number[])[0] / 100 })}
              min={85}
              max={120}
              step={1}
              className="flex-1"
              aria-label="Body font size"
            />
            <span className="w-10 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
              {Math.round(p.typeScale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-16 shrink-0 text-caption text-muted-foreground">Heading scale</Label>
            <Slider
              value={[Math.round(p.titleScale * 100)]}
              onValueChange={(v) => patchPersonalization({ titleScale: (v as number[])[0] / 100 })}
              min={85}
              max={125}
              step={1}
              className="flex-1"
              aria-label="Heading scale"
            />
            <span className="w-10 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
              {Math.round(p.titleScale * 100)}%
            </span>
          </div>
        </div>
      </Panel>

      {/* 动效 */}
      <Panel
        icon={Sparkles}
        title="Animation intensity"
        description="Controls transitions and decorative effects. Colors and borders still convey state when disabled."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Animation intensity"
            value={p.motion}
            options={MOTION_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
            onChange={(v) => patchPersonalization({ motion: v })}
          />
          <span className="text-micro text-muted-foreground">
            {MOTION_OPTIONS.find((m) => m.value === p.motion)?.hint}
          </span>
        </div>
      </Panel>

      {/* 预设 */}
      <Panel
        icon={Save}
        title="My presets"
        description="Save your current theme settings as a named preset for later use."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g. Night writing"
            maxLength={40}
            className="h-8 w-48"
            aria-label="Preset name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (savePreset(presetName)) setPresetName('')
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 gap-1"
            disabled={!presetName.trim() || presets.length >= 30}
            onClick={() => {
              if (savePreset(presetName)) setPresetName('')
            }}
          >
            <Save className="h-3.5 w-3.5" />
            Save as preset
          </Button>
          {presets.length >= 30 && (
            <span className="text-micro text-muted-foreground">Up to 30 presets</span>
          )}
        </div>

        {presets.length === 0 ? (
          <p className="mt-3 text-caption text-muted-foreground">
            No custom presets yet. Adjust your appearance and save it with a name.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border">
            {presets.map((preset) => (
              <li
                key={preset.id}
                className="flex flex-wrap items-center gap-2 bg-surface-2/60 px-3 py-2"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      preset.personalization.accent ??
                      getTheme(preset.baseThemeId).preview[
                        getTheme(preset.baseThemeId).defaultMode
                      ].accent,
                  }}
                  aria-hidden="true"
                />
                {renamingId === preset.id ? (
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="h-7 w-40"
                    aria-label="Rename preset"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renamePreset(preset.id, renameValue)
                        setRenamingId(null)
                      }
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-body">{preset.name}</span>
                )}
                <span className="text-micro text-muted-foreground">
                  {getTheme(preset.baseThemeId).name}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-micro"
                    onClick={() => applyPreset(preset.id)}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-micro text-muted-foreground"
                    onClick={() => {
                      setRenamingId(preset.id)
                      setRenameValue(preset.name)
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deletePreset(preset.id)}
                    aria-label={`Delete preset ${preset.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Character library */}
      <CharacterLibraryPanel />

      {/* Smart colors */}
      <ColorPanel />

      {/* Atmosphere */}
      <AtmospherePanel />

      {/* 恢复 + 导入导出 */}
      <Panel
        icon={RotateCcw}
        title="Restore and migrate"
        description="Resetting appearance does not affect your tasks, habits or reviews."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            disabled={!isCustomized}
            onClick={() => setConfirmAction('current')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset current theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-destructive hover:text-destructive"
            onClick={() => setConfirmAction('all')}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset everything
          </Button>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Import settings
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              handleImportFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {importOk && <span className="text-micro text-success">Imported</span>}
          {importError && <span className="text-micro text-destructive">{importError}</span>}
        </div>
        <p className="mt-2 text-micro text-muted-foreground">
          The JSON settings file contains only appearance settings; invalid values are ignored.
        </p>
      </Panel>

      {/* 恢复确认 */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-section">
              {confirmAction === 'all' ? 'Reset all appearance settings' : 'Reset current theme'}
            </DialogTitle>
            <DialogDescription className="text-caption text-muted-foreground">
              {confirmAction === 'all'
                ? 'Resets the theme and clears custom settings and presets. Your tasks, habits and reviews are safe.'
                : `Reset custom colors, corners, fonts and animations for ${theme.name}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmAction === 'all') resetAll()
                else resetCurrentTheme()
                setConfirmAction(null)
              }}
            >
              Confirm reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
