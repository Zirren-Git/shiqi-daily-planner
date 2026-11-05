// ============================================================
// 主题注册表：六套内置主题的元数据
//
// 新增第七套主题只需要：
// 1. 在 types.ts 的 ThemeId 里加一个 id
// 2. 在 src/styles 下加一个 theme-<id>.css（调色板 + 结构规则）
// 3. 在下方 THEMES 里加一条元数据
// 4. 在 src/styles/themes.css 里 @import 新文件
// 业务页面不需要任何改动。
// ============================================================

import type {
  FontId,
  MotionLevel,
  RadiusSettings,
  ThemeDefinition,
  ThemeId,
  ThemePersonalization,
} from './types'

export const DEFAULT_RADIUS: RadiusSettings = {
  button: 8,
  card: 12,
  input: 8,
  dialog: 16,
}

export const SCALE_OPTIONS = [0.8, 0.9, 1, 1.1, 1.25, 1.5] as const

export const MOTION_OPTIONS: { value: MotionLevel; label: string; hint: string }[] = [
  { value: 'off', label: 'Off', hint: 'No animation; colors and borders still show state' },
  { value: 'low', label: 'Low', hint: 'Only essential transitions' },
  { value: 'standard', label: 'Standard', hint: 'Recommended by the theme' },
  { value: 'high', label: 'High', hint: 'More pronounced motion and effects' },
]

export const FONT_OPTIONS: { value: FontId; label: string; stack: string; hint: string }[] = [
  { value: 'theme', label: 'Follow theme', stack: '', hint: 'Use the current theme’s font' },
  {
    value: 'system',
    label: 'System sans-serif',
    stack: 'var(--font-ui, ui-sans-serif), "Segoe UI", system-ui, "Microsoft YaHei", sans-serif',
    hint: 'A reliable default',
  },
  {
    value: 'rounded',
    label: 'Rounded sans-serif',
    stack: '"Segoe UI Rounded", "Hiragino Maru Gothic ProN", "Yu Gothic UI", "Microsoft YaHei UI", system-ui, sans-serif',
    hint: 'Friendly and rounded',
  },
  {
    value: 'mono',
    label: 'Monospace',
    stack: 'var(--font-geist-mono), "Cascadia Mono", Consolas, "Sarasa Mono SC", ui-monospace, monospace',
    hint: 'Digital and terminal-inspired',
  },
  {
    value: 'serif',
    label: 'Serif',
    stack: 'Georgia, "Songti SC", "SimSun", "Noto Serif SC", ui-serif, serif',
    hint: 'Classic editorial look',
  },
]

function p(overrides: Partial<ThemePersonalization> = {}): ThemePersonalization {
  return {
    accent: null,
    radius: { ...DEFAULT_RADIUS },
    scale: 1,
    fontId: 'theme',
    typeScale: 1,
    titleScale: 1,
    motion: 'standard',
    ...overrides,
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'fluent',
    name: 'Mica',
    latinName: 'Fluent',
    tagline: 'Clean, layered Windows 11 style',
    description:
      'Inspired by Windows 11 Mica, with soft translucent surfaces and clear layers. Comfortable for everyday use.',
    keywords: ['Fluent', 'Acrylic', 'Mica', 'Desktop'],
    modes: ['light', 'dark'],
    defaultMode: 'light',
    recommended: true,
    preview: {
      light: {
        background: '#f3f3f3',
        surface: '#ffffff',
        text: '#1b1b1f',
        accent: '#0067c0',
        accentSoft: 'rgba(0, 103, 192, 0.12)',
      },
      dark: {
        background: '#202020',
        surface: '#2b2b2b',
        text: '#f5f5f5',
        accent: '#4cc2ff',
        accentSoft: 'rgba(76, 194, 255, 0.16)',
      },
    },
    defaults: p({ radius: { button: 4, card: 8, input: 4, dialog: 12 } }),
  },
  {
    id: 'anime',
    name: 'Sakura',
    latinName: 'Anime',
    tagline: 'Light and playful anime-inspired design',
    description:
      'Soft pink, lavender and sky blue with rounded cards, stars and playful motion.',
    keywords: ['Anime', 'Pastel', 'Kawaii', 'Soft UI'],
    modes: ['light', 'dark'],
    defaultMode: 'light',
    preview: {
      light: {
        background: '#fff6fa',
        surface: '#ffffff',
        text: '#43314a',
        accent: '#db2777',
        accentSoft: 'rgba(219, 39, 119, 0.16)',
      },
      dark: {
        background: '#241c2b',
        surface: '#2f2638',
        text: '#f7ecf7',
        accent: '#f9a8d4',
        accentSoft: 'rgba(249, 168, 212, 0.18)',
      },
    },
    defaults: p({ radius: { button: 999, card: 20, input: 12, dialog: 24 }, motion: 'high' }),
  },
  {
    id: 'cyber',
    name: 'Neon Terminal',
    latinName: 'Cyberpunk',
    tagline: 'HUD panels and cool scanlines',
    description:
      'Deep-space surfaces, cyan data lines and clipped panels. Designed for night work.',
    keywords: ['Cyberpunk', 'HUD', 'Neon', 'Sci-Fi'],
    modes: ['dark'],
    defaultMode: 'dark',
    preview: {
      light: {
        background: '#05070d',
        surface: '#0b1220',
        text: '#d7f7ff',
        accent: '#22d3ee',
        accentSoft: 'rgba(34, 211, 238, 0.16)',
      },
      dark: {
        background: '#05070d',
        surface: '#0b1220',
        text: '#d7f7ff',
        accent: '#22d3ee',
        accentSoft: 'rgba(34, 211, 238, 0.16)',
      },
    },
    defaults: p({ radius: { button: 2, card: 4, input: 2, dialog: 6 }, motion: 'low' }),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    latinName: 'Minimal',
    tagline: 'Refined simplicity',
    description:
      'Minimal borders and shadows, with spacing and typography providing structure.',
    keywords: ['Minimal', 'Apple', 'Linear', 'Clean'],
    modes: ['light', 'dark'],
    defaultMode: 'light',
    preview: {
      light: {
        background: '#fbfbfa',
        surface: '#ffffff',
        text: '#111113',
        accent: '#17171a',
        accentSoft: 'rgba(23, 23, 26, 0.06)',
      },
      dark: {
        background: '#0c0c0e',
        surface: '#141417',
        text: '#f4f4f5',
        accent: '#f4f4f5',
        accentSoft: 'rgba(244, 244, 245, 0.1)',
      },
    },
    defaults: p({ radius: { button: 6, card: 10, input: 6, dialog: 14 } }),
  },
  {
    id: 'pixel',
    name: 'Retro Pixel',
    latinName: 'Retro Pixel',
    tagline: 'Retro 8-bit handheld and arcade style',
    description:
      'Hard edges, pixel-inspired headings and stepped animations.',
    keywords: ['Retro', 'Pixel Art', '8-bit', 'Arcade'],
    modes: ['light', 'dark'],
    defaultMode: 'light',
    preview: {
      light: {
        background: '#f4f1ea',
        surface: '#fffdf6',
        text: '#1a1c2c',
        accent: '#d7263d',
        accentSoft: 'rgba(215, 38, 61, 0.14)',
      },
      dark: {
        background: '#14162b',
        surface: '#1d2040',
        text: '#f4f4f4',
        accent: '#ff5470',
        accentSoft: 'rgba(255, 84, 112, 0.18)',
      },
    },
    defaults: p({ radius: { button: 0, card: 0, input: 0, dialog: 0 }, motion: 'low' }),
  },
  {
    id: 'bento',
    name: 'Dark Bento',
    latinName: 'Dark Bento',
    tagline: 'Dark modular cards at a glance',
    description:
      'Low-saturation dark surfaces with modular cards for tasks, habits and insights.',
    keywords: ['Dark', 'Bento', 'Premium', 'SaaS'],
    modes: ['dark'],
    defaultMode: 'dark',
    preview: {
      light: {
        background: '#0a0c11',
        surface: '#12151d',
        text: '#e7eaf0',
        accent: '#7dd3fc',
        accentSoft: 'rgba(125, 211, 252, 0.14)',
      },
      dark: {
        background: '#0a0c11',
        surface: '#12151d',
        text: '#e7eaf0',
        accent: '#7dd3fc',
        accentSoft: 'rgba(125, 211, 252, 0.14)',
      },
    },
    defaults: p({ radius: { button: 10, card: 16, input: 10, dialog: 20 } }),
  },
]

export const THEME_IDS = THEMES.map((t) => t.id)

export const DEFAULT_THEME_ID: ThemeId = 'fluent'

export function getTheme(id: string | null | undefined): ThemeDefinition {
  const found = THEMES.find((t) => t.id === id)
  // 非法 id 一律回退到默认主题，避免坏配置把界面弄成默认浏览器样式
  return found ?? THEMES[0]
}

/** 主题是否支持某个明暗模式 */
export function supportsMode(id: ThemeId, mode: 'light' | 'dark'): boolean {
  return getTheme(id).modes.includes(mode)
}

/** 主题在该模式下的有效模式（只支持一种时强制使用它） */
export function resolveMode(
  id: ThemeId,
  desired: 'light' | 'dark',
  system?: 'light' | 'dark'
): 'light' | 'dark' {
  const theme = getTheme(id)
  if (theme.modes.length === 1) return theme.modes[0]
  return theme.modes.includes(desired) ? desired : (system ?? theme.defaultMode)
}
