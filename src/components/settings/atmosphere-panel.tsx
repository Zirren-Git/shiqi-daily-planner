'use client'

// ============================================================
// 氛围设置面板
//
// 组织：模式 → 背景 → Character → Daily quote → 效果 → 恢复。
// 自定义素材（Character图片/壁纸）走 lib/atmosphere/custom-assets，
// 存在独立 IndexedDB 里，不碰业务数据。
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ImageIcon,
  MessageSquareQuote,
  RotateCcw,
  Sparkles,
  Sunrise,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAppearance } from '@/providers/appearance-provider'
import {
  EXPRESSION_LABELS,
  charactersForTheme,
  quotesForTheme,
  scenesForTheme,
  type CharacterExpression,
} from '@/lib/theme/atmosphere'
import type { CharacterPosition } from '@/lib/theme/types'
import { renderCharacter, renderScene } from '@/components/atmosphere/art/registry'
import { QuoteStrip } from '@/components/atmosphere/quote-strip'
import {
  addAsset,
  deleteAsset,
  refreshAssets,
  useAssetsLoaded,
  useCustomAssets,
} from '@/lib/atmosphere/custom-assets'

function Row({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-body text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-micro text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
  ariaLabel,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
  ariaLabel: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-16 shrink-0 text-caption text-muted-foreground">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange((v as number[])[0])}
        min={min}
        max={max}
        step={step}
        className="flex-1"
        aria-label={ariaLabel}
      />
      <span className="w-11 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
        {value}
        {suffix}
      </span>
    </div>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap items-center gap-0.5 rounded-full bg-surface-2 p-0.5"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-7 rounded-full px-2.5 text-caption ui-transition',
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

/** Character包文件名 → 状态（normal/happy/thinking/working/success/error 等） */
const STATE_ALIASES: Record<string, CharacterExpression> = {
  normal: 'idle',
  idle: 'idle',
  default: 'idle',
  happy: 'happy',
  smile: 'happy',
  thinking: 'thinking',
  think: 'thinking',
  working: 'working',
  work: 'working',
  success: 'happy',
  done: 'happy',
  error: 'error',
  fail: 'error',
  sleepy: 'sleepy',
  sleep: 'sleepy',
}

const POSITIONS: { value: CharacterPosition; label: string }[] = [
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'hero', label: 'Hero' },
  { value: 'sidebar', label: 'Sidebar' },
]

export function AtmospherePanel() {
  const { state, theme, patchAtmosphere, resetAtmosphere } = useAppearance()
  const atmo = state.atmosphere
  const [customQuote, setCustomQuote] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importOk, setImportOk] = useState<string | null>(null)
  const bgInput = useRef<HTMLInputElement>(null)
  const charInput = useRef<HTMLInputElement>(null)

  const assets = useCustomAssets()
  const assetsLoaded = useAssetsLoaded()

  useEffect(() => {
    if (!assetsLoaded) void refreshAssets()
  }, [assetsLoaded])

  const scenes = useMemo(() => scenesForTheme(state.themeId), [state.themeId])
  const characters = useMemo(() => charactersForTheme(state.themeId), [state.themeId])
  const activeSceneId = atmo.sceneByTheme[state.themeId] ?? scenes[0]?.id
  const activeCharacter =
    characters.find((c) => c.id === atmo.characterByTheme[state.themeId]) ?? characters[0]
  const customList = atmo.customQuotes[state.themeId] ?? []
  const builtinCount = quotesForTheme(state.themeId).length
  const customCharacters = assets.filter((a) => a.kind === 'character')
  const customBackgrounds = assets.filter((a) => a.kind === 'background')

  const setScene = (id: string) =>
    patchAtmosphere({
      sceneByTheme: { ...atmo.sceneByTheme, [state.themeId]: id },
      bgSource: 'scene',
    })

  const setCharacter = (id: string) =>
    patchAtmosphere({
      characterByTheme: { ...atmo.characterByTheme, [state.themeId]: id },
      customCharacterId: null,
    })

  const addCustomQuote = () => {
    const text = customQuote.trim()
    if (!text) return
    patchAtmosphere({
      customQuotes: {
        ...atmo.customQuotes,
        [state.themeId]: [...customList, text].slice(0, 20),
      },
    })
    setCustomQuote('')
  }

  const handleUpload = async (
    file: File | undefined,
    kind: 'character' | 'background',
    reqState?: CharacterExpression
  ) => {
    if (!file) return
    setImportError(null)
    setImportOk(null)
    const result = await addAsset(file, { kind, name: file.name, state: reqState })
    if (!result.ok) {
      setImportError(result.error)
      return
    }
    setImportOk(result.asset.name)
    if (kind === 'background') {
      patchAtmosphere({ bgSource: 'custom', customBackgroundId: result.asset.id })
    } else {
      patchAtmosphere({
        customCharacterId: result.asset.id,
        characterEnabled: true,
        mode: 'immersive',
      })
    }
  }

  /** 多选导入：文件名命中状态词就绑定该状态，否则当作通用立绘 */
  const handleCharacterPack = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    // 先把 FileList 拍成数组：调用方会立刻清空 input，之后再读 files[0] 就是 undefined
    const picked = Array.from(files).slice(0, 8)
    if (picked.length === 0) return
    setImportError(null)
    setImportOk(null)
    const groupId = `group-${Date.now().toString(36)}`
    const stripExt = (name: string) => name.replace(/\.[^.]+$/, '')
    const packName = stripExt(picked[0].name)
    const isPack = picked.length > 1
    let selectedId: string | null = null

    for (const file of picked) {
      const base = stripExt(file.name).toLowerCase()
      const mapped = STATE_ALIASES[base]
      const result = await addAsset(file, {
        kind: 'character',
        name: isPack ? packName : stripExt(file.name),
        state: mapped,
        groupId,
      })
      if (!result.ok) {
        setImportError(result.error)
        continue
      }
      // 优先选通用图（没有命中状态词的那张）作为入口
      if (!selectedId || mapped === undefined) selectedId = result.asset.id
    }

    if (selectedId) {
      setImportOk(isPack ? `${picked.length} expressions` : packName)
      patchAtmosphere({
        customCharacterId: selectedId,
        characterEnabled: true,
        mode: 'immersive',
      })
    }
  }

  return (
    <section className="surface p-4" data-testid="atmosphere-panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-section text-foreground">Atmosphere</h2>
            <p className="mt-0.5 text-caption text-muted-foreground">
              Scenes, characters, quotes and animation, available offline. Switch back to a distraction-free workspace anytime.
            </p>
          </div>
        </div>
        <Switch
          checked={atmo.enabled}
          onCheckedChange={(v) => patchAtmosphere({ enabled: v, mode: v ? 'immersive' : atmo.mode })}
          aria-label="Atmosphere toggle"
        />
      </div>

      {/* 模式 */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Segmented
          value={atmo.mode}
          onChange={(mode) => patchAtmosphere({ mode, enabled: true })}
          options={[
            { value: 'immersive', label: 'Immersive mode' },
            { value: 'pure', label: 'Distraction-free mode' },
          ]}
          ariaLabel="Atmosphere mode"
        />
        <span className="text-micro text-muted-foreground">
          {atmo.mode === 'immersive'
            ? 'Show backgrounds, characters, quotes and animations'
            : 'Hide characters, dim backgrounds and stop animation while keeping theme colors'}
        </span>
      </div>

      <div className={cn(!atmo.enabled && 'pointer-events-none opacity-50')}>
        {/* 背景 */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {theme.name} · Scenes
            </p>
            <div className="flex items-center gap-1">
              <span className="text-micro text-muted-foreground">{scenes.length} scenes</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-micro text-muted-foreground"
                onClick={() => bgInput.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Import wallpaper
              </Button>
              <input
                ref={bgInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleUpload(e.target.files?.[0], 'background')
                  e.target.value = ''
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {scenes.map((scene) => {
              const active = atmo.bgSource === 'scene' && activeSceneId === scene.id
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setScene(scene.id)}
                  aria-pressed={active}
                  data-testid={`scene-${scene.id}`}
                  className={cn(
                    'atmo-thumb group relative border-2 text-left ui-transition',
                    active
                      ? 'border-primary shadow-[var(--shadow-card)]'
                      : 'border-transparent hover:border-border-strong'
                  )}
                >
                  <div className="relative h-20 w-full overflow-hidden bg-surface-2">
                    {renderScene(scene.id, 'h-full w-full')}
                  </div>
                  <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                    <span className="truncate text-micro text-foreground">{scene.name}</span>
                    {active && <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />}
                  </div>
                </button>
              )
            })}
          </div>

          {customBackgrounds.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-micro text-muted-foreground">My wallpapers</p>
              {customBackgrounds.map((asset) => {
                const active = atmo.bgSource === 'custom' && atmo.customBackgroundId === asset.id
                return (
                  <div
                    key={asset.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-2 py-1',
                      active ? 'border-primary/50 bg-primary/[0.06]' : 'border-border'
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-caption text-foreground"
                      onClick={() =>
                        patchAtmosphere({ bgSource: 'custom', customBackgroundId: asset.id })
                      }
                    >
                      {asset.name}
                      {active && <span className="ml-1.5 text-primary">In use</span>}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete wallpaper ${asset.name}`}
                      onClick={() => {
                        void deleteAsset(asset.id)
                        if (atmo.customBackgroundId === asset.id) {
                          patchAtmosphere({ bgSource: 'scene', customBackgroundId: null })
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <Row label="Rotate randomly" description="Choose a new image each day">
            <Switch
              checked={atmo.rotateScenes}
              onCheckedChange={(v) => patchAtmosphere({ rotateScenes: v })}
              aria-label="Rotate scenes randomly"
            />
          </Row>

          <div className="mt-1 space-y-2.5">
            <SliderRow
              label="Visibility"
              value={atmo.bgOpacity}
              min={0}
              max={100}
              step={5}
              suffix="%"
              ariaLabel="Background visibility"
              onChange={(v) => patchAtmosphere({ bgOpacity: v })}
            />
            <SliderRow
              label="Blur"
              value={atmo.bgBlur}
              min={0}
              max={20}
              suffix="px"
              ariaLabel="Background blur"
              onChange={(v) => patchAtmosphere({ bgBlur: v })}
            />
            <SliderRow
              label="Dim"
              value={atmo.bgDarken}
              min={0}
              max={60}
              step={5}
              suffix="%"
              ariaLabel="Background dimming"
              onChange={(v) => patchAtmosphere({ bgDarken: v })}
            />
            <SliderRow
              label="Overlay"
              value={atmo.bgMask}
              min={0}
              max={100}
              step={5}
              suffix="%"
              ariaLabel="Overlay strength"
              onChange={(v) => patchAtmosphere({ bgMask: v })}
            />
            <SliderRow
              label="Hue"
              value={atmo.bgHue}
              min={-30}
              max={30}
              suffix="°"
              ariaLabel="Background hue"
              onChange={(v) => patchAtmosphere({ bgHue: v })}
            />
            <SliderRow
              label="Brightness"
              value={atmo.bgBrightness}
              min={70}
              max={130}
              suffix="%"
              ariaLabel="Background brightness"
              onChange={(v) => patchAtmosphere({ bgBrightness: v })}
            />
          </div>
        </div>

        {/* Character */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Character companion
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-micro text-muted-foreground"
                onClick={() => charInput.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Import character image
              </Button>
              <input
                ref={charInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleCharacterPack(e.target.files)
                  e.target.value = ''
                }}
              />
              <Switch
                checked={atmo.characterEnabled}
                onCheckedChange={(v) => patchAtmosphere({ characterEnabled: v })}
                aria-label="Show character"
              />
            </div>
          </div>

          {characters.length > 0 && (
            <div className="space-y-2">
              {characters.map((character) => {
                const active = !atmo.customCharacterId && activeCharacter?.id === character.id
                return (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => setCharacter(character.id)}
                    aria-pressed={active}
                    data-testid={`character-${character.id}`}
                    className={cn(
                      'atmo-thumb flex w-full items-center gap-3 border p-2 text-left ui-transition',
                      active
                        ? 'border-primary/50 bg-primary/[0.06]'
                        : 'border-border hover:bg-accent/60'
                    )}
                  >
                    <span className="atmo-thumb flex h-16 w-14 shrink-0 items-center justify-center bg-surface-2">
                      {renderCharacter(character.id, {
                        expression: 'idle',
                        className: 'h-full w-full',
                      })}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-body font-medium text-foreground">
                          {character.name}
                        </span>
                        {active && (
                          <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] text-primary">
                            In use
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-micro text-muted-foreground">
                        {character.description}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {character.expressions.map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {EXPRESSION_LABELS[e]}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {customCharacters.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-micro text-muted-foreground">My character images</p>
              {customCharacters.map((asset) => {
                const active = atmo.customCharacterId === asset.id
                return (
                  <div
                    key={asset.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-2 py-1',
                      active ? 'border-primary/50 bg-primary/[0.06]' : 'border-border'
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-caption text-foreground"
                      onClick={() =>
                        patchAtmosphere({
                          customCharacterId: asset.id,
                          characterEnabled: true,
                          mode: 'immersive',
                        })
                      }
                    >
                      {asset.name}
                      {active && <span className="ml-1.5 text-primary">In use</span>}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete character image ${asset.name}`}
                      onClick={() => {
                        void deleteAsset(asset.id)
                        if (atmo.customCharacterId === asset.id) {
                          patchAtmosphere({ customCharacterId: null })
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-2 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-caption text-muted-foreground">Position</Label>
              <Segmented
                value={atmo.characterPosition}
                onChange={(v) => patchAtmosphere({ characterPosition: v })}
                options={POSITIONS}
                ariaLabel="Character position"
              />
            </div>
            <SliderRow
              label="Size"
              value={atmo.characterSize}
              min={60}
              max={160}
              step={5}
              suffix="%"
              ariaLabel="Character size"
              onChange={(v) => patchAtmosphere({ characterSize: v })}
            />
            <SliderRow
              label="Opacity"
              value={atmo.characterOpacity}
              min={30}
              max={100}
              step={5}
              suffix="%"
              ariaLabel="Character opacity"
              onChange={(v) => patchAtmosphere({ characterOpacity: v })}
            />
          </div>

          <Row label="Automatic reactions" description="React to task completion, focus and errors">
            <Switch
              checked={atmo.characterAutoState}
              onCheckedChange={(v) => patchAtmosphere({ characterAutoState: v })}
              aria-label="Automatic reactions toggle"
            />
          </Row>
          <Row label="Expression animation" description="Idle and transition animations; turn off for still images">
            <Switch
              checked={atmo.characterAnimate}
              onCheckedChange={(v) => patchAtmosphere({ characterAnimate: v })}
              aria-label="Expression animation toggle"
            />
          </Row>
          <Row label="Greetings" description="Let the character react to tasks and errors">
            <Switch
              checked={atmo.characterWelcome}
              onCheckedChange={(v) => patchAtmosphere({ characterWelcome: v })}
              aria-label="Character greetings toggle"
            />
          </Row>
        </div>

        {/* Daily quote */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" />
              Daily quote
            </p>
            <Switch
              checked={atmo.quoteEnabled}
              onCheckedChange={(v) => patchAtmosphere({ quoteEnabled: v })}
              aria-label="Daily quote toggle"
            />
          </div>

          <QuoteStrip className="mb-2" />

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              placeholder="Add your own quote…"
              maxLength={120}
              className="h-8 w-56"
              aria-label="Custom quote"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomQuote()
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={!customQuote.trim() || customList.length >= 20}
              onClick={addCustomQuote}
            >
              Add
            </Button>
            <span className="text-micro text-muted-foreground">
              {builtinCount} built-in · {customList.length}/20 custom
            </span>
          </div>

          {customList.length > 0 && (
            <ul className="mt-2 space-y-1">
              {customList.map((text, i) => (
                <li
                  key={`${text}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1"
                >
                  <span className="min-w-0 truncate text-caption text-foreground">{text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 shrink-0 px-1.5 text-micro text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      patchAtmosphere({
                        customQuotes: {
                          ...atmo.customQuotes,
                          [state.themeId]: customList.filter((_, idx) => idx !== i),
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 效果 */}
        <div className="border-t border-border pt-3">
          <Row label="Ambient animation" description="Petals, stars, scanlines and pixel effects">
            <Switch
              checked={atmo.animations}
              onCheckedChange={(v) => patchAtmosphere({ animations: v })}
              aria-label="Ambient animation toggle"
            />
          </Row>
          <Row label="Celebrate completion" description="Show confetti when a task is completed">
            <Switch
              checked={atmo.celebration}
              onCheckedChange={(v) => patchAtmosphere({ celebration: v })}
              aria-label="Celebration toggle"
            />
          </Row>
          <Row label="Daily welcome screen" description="Show a scene and greeting when you first open the app each day">
            <Switch
              checked={atmo.welcome}
              onCheckedChange={(v) => patchAtmosphere({ welcome: v })}
              aria-label="Welcome screen toggle"
            />
          </Row>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={resetAtmosphere}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to default theme artwork
          </Button>
          <span className="flex items-center gap-1 text-micro text-muted-foreground">
            <Sunrise className="h-3 w-3" aria-hidden="true" />
            Built-in artwork is original SVG. Custom images remain on your device.
          </span>
          {importError && <span className="text-micro text-destructive">{importError}</span>}
          {importOk && <span className="text-micro text-success">Imported {importOk}</span>}
        </div>
      </div>
    </section>
  )
}
