// ============================================================
// 主题氛围系统：场景、角色、短句的数据契约
//
// 所有视觉素材都是本项目原创的 SVG（程序化绘制），随软件打包、离线可用，
// 不依赖任何第三方图片 URL，也不含任何受版权保护的角色/作品。
// 素材清单见 docs/ATMOSPHERE_ASSETS.md。
//
// 新增一套主题的氛围内容只需要：
// 1. 在 SCENES / CHARACTERS 里加条目
// 2. 在 components/atmosphere/art 下加对应的 SVG 组件并注册
// 3. 在 QUOTES 里加短句
// 运行时与设置界面会自动出现新选项。
// ============================================================

import type { ThemeId } from './types'

// ------------------------------------------------------------
// 场景
// ------------------------------------------------------------

export interface SceneDefinition {
  id: string
  themeId: ThemeId
  name: string
  description: string
  /** 缩略图与遮罩用的主色调 */
  tint: string
  /** 场景明暗：决定默认遮罩强度，保证文字可读 */
  luminance: 'light' | 'mid' | 'dark'
}

export const SCENES: SceneDefinition[] = [
  // 樱色 Anime
  {
    id: 'anime-sakura-street',
    themeId: 'anime',
    name: 'Cherry Blossom Street',
    description: 'A hillside on the way home, petals drifting on the wind',
    tint: '#f9a8d4',
    luminance: 'light',
  },
  {
    id: 'anime-sunset-city',
    themeId: 'anime',
    name: 'Sunset City',
    description: 'Sunset over rooftop buildings',
    tint: '#fb923c',
    luminance: 'mid',
  },
  {
    id: 'anime-star-night',
    themeId: 'anime',
    name: 'Starry Sky',
    description: 'The Milky Way on a summer night',
    tint: '#818cf8',
    luminance: 'dark',
  },
  // 霓虹终端 Cyberpunk
  {
    id: 'cyber-orbit-station',
    themeId: 'cyber',
    name: 'Orbital Station',
    description: 'Planetary rings beyond the cabin window',
    tint: '#0e7490',
    luminance: 'dark',
  },
  {
    id: 'cyber-neon-rain',
    themeId: 'cyber',
    name: 'Neon Rain',
    description: 'Rain falls across holographic signs',
    tint: '#22d3ee',
    luminance: 'dark',
  },
  {
    id: 'cyber-deep-space',
    themeId: 'cyber',
    name: 'Deep Space',
    description: 'A star chart beyond the navigation screen',
    tint: '#1e3a8a',
    luminance: 'dark',
  },
  // 云母 Fluent
  {
    id: 'fluent-aurora',
    themeId: 'fluent',
    name: 'Aurora Mountains',
    description: 'Quiet aurora over the snowy ridgeline',
    tint: '#7dd3fc',
    luminance: 'mid',
  },
  {
    id: 'fluent-dunes',
    themeId: 'fluent',
    name: 'Soft Dunes',
    description: 'Gentle curves shaped by the desert wind',
    tint: '#fcd9a8',
    luminance: 'light',
  },
  {
    id: 'fluent-morning',
    themeId: 'fluent',
    name: 'Morning Geometry',
    description: 'Soft geometry in the morning light',
    tint: '#c7dcf7',
    luminance: 'light',
  },
  // 留白 Minimal
  {
    id: 'minimal-ridge',
    themeId: 'minimal',
    name: 'Monochrome Ridge',
    description: 'Mountains, mist and today’s plans',
    tint: '#6b7280',
    luminance: 'light',
  },
  {
    id: 'minimal-lake',
    themeId: 'minimal',
    name: 'Misty Lake',
    description: 'A still lake with room to breathe',
    tint: '#9ca3af',
    luminance: 'light',
  },
  {
    id: 'minimal-skyline',
    themeId: 'minimal',
    name: 'City Skyline',
    description: 'A quiet skyline at six in the morning',
    tint: '#a1a1aa',
    luminance: 'light',
  },
  // 像素机 Retro Pixel
  {
    id: 'pixel-town',
    themeId: 'pixel',
    name: 'Pixel Town',
    description: 'A save point in the town square',
    tint: '#29adff',
    luminance: 'mid',
  },
  {
    id: 'pixel-forest',
    themeId: 'pixel',
    name: 'Pixel Forest',
    description: 'A forest with hidden surprises',
    tint: '#3ba55d',
    luminance: 'dark',
  },
  {
    id: 'pixel-sky',
    themeId: 'pixel',
    name: 'Pixel Night Sky',
    description: 'An eight-bit sky dotted with stars',
    tint: '#1a1c2c',
    luminance: 'dark',
  },
  // 暗格 Dark Bento
  {
    id: 'bento-mesh',
    themeId: 'bento',
    name: 'Golden Grid',
    description: 'A muted golden grid for the workspace',
    tint: '#f59e0b',
    luminance: 'dark',
  },
  {
    id: 'bento-ocean',
    themeId: 'bento',
    name: 'Deep Blue Current',
    description: 'Deep ocean blue for long work sessions',
    tint: '#0ea5e9',
    luminance: 'dark',
  },
  {
    id: 'bento-grain',
    themeId: 'bento',
    name: 'Grainy Gradient',
    description: 'A soft grain adds warmth to the dark',
    tint: '#7dd3fc',
    luminance: 'dark',
  },
]

export function scenesForTheme(themeId: ThemeId): SceneDefinition[] {
  return SCENES.filter((s) => s.themeId === themeId)
}

export function getScene(id: string | null | undefined): SceneDefinition | null {
  return SCENES.find((s) => s.id === id) ?? null
}

/** 主题的默认场景（第一张） */
export function defaultSceneFor(themeId: ThemeId): SceneDefinition {
  return scenesForTheme(themeId)[0]
}

// ------------------------------------------------------------
// 角色
// ------------------------------------------------------------

export type CharacterExpression = 'idle' | 'happy' | 'thinking' | 'working' | 'error' | 'sleepy'

export const EXPRESSION_LABELS: Record<CharacterExpression, string> = {
  idle: 'Idle',
  happy: 'Happy',
  thinking: 'Thinking',
  working: 'Working',
  error: 'Sorry',
  sleepy: 'Sleepy',
}

export interface CharacterDefinition {
  id: string
  themeId: ThemeId
  name: string
  /** 一句话设定，展示在设置页 */
  description: string
  expressions: CharacterExpression[]
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'pixel-pix',
    themeId: 'pixel',
    name: 'PIX',
    description: 'An eight-bit adventurer who jumps for joy when you finish a task',
    expressions: ['idle', 'happy', 'thinking', 'working', 'error'],
  },
]

export const CHARACTER_IDS = CHARACTERS.map((c) => c.id)

export function charactersForTheme(themeId: ThemeId): CharacterDefinition[] {
  return CHARACTERS.filter((c) => c.themeId === themeId)
}

export function getCharacter(id: string | null | undefined): CharacterDefinition | null {
  return CHARACTERS.find((c) => c.id === id) ?? null
}

export function defaultCharacterFor(themeId: ThemeId): CharacterDefinition | null {
  return charactersForTheme(themeId)[0] ?? null
}

/** 角色台词：按真实状态切换，不编造不存在的进度 */
export const CHARACTER_LINES: Record<string, Partial<Record<CharacterExpression, string[]>>> = {
  'pixel-pix': {
    idle: ['READY.', 'Ready for another quest?', 'There are still tasks on the list.'],
    happy: ['LEVEL UP!', 'Level complete!'],
    thinking: ['Let me check the map…', 'Is this the right way?'],
    working: ['Working on it.', 'Almost there!'],
    error: ['Game over… Try again.', 'Found a bug.'],
  },
}

export function linesFor(characterId: string, expression: CharacterExpression): string[] {
  const byExpression = CHARACTER_LINES[characterId]
  if (!byExpression) return []
  return byExpression[expression] ?? byExpression.idle ?? []
}

// ------------------------------------------------------------
// 短句库
//
// 原创短句为本项目创作；标注了作者的条目出自公有领域古籍（礼记/论语/庄子/
// 陶渊明/苏轼/王维等），作者与出处均已核对，不含任何现代版权文本。
// ------------------------------------------------------------

export interface Quote {
  text: string
  /** 作者或出处；原创短句留空 */
  author?: string
  /** 公有领域出处说明 */
  source?: string
}

export const QUOTES: Record<ThemeId, Quote[]> = {
  anime: [
    { text: 'Writing it down is already half the work.' },
    { text: 'A small step today can become a bright memory tomorrow.' },
    { text: 'Even falling cherry blossoms leave time to finish one task.' },
    { text: 'Every small task completed on time adds up.' },
    { text: 'Look at the sky when you are tired; the clouds will wait.' },
    { text: 'The story is not finished; today is just one page.' },
    { text: 'Finish the most important task first; the rest will feel lighter.' },
    { text: 'Your effort matters, even on ordinary days.' },
  ],
  cyber: [
    { text: 'The unknown is not an obstacle; it is a coordinate to explore.' },
    { text: 'Every task is a chance to upgrade your system.' },
    { text: 'The signal may drop; keep your direction.' },
    { text: 'Stay on frequency even through the noise.' },
    { text: 'Turn complexity into actionable steps.' },
    { text: 'The logs will show how far you came.' },
    { text: 'Do not wait for the perfect answer. Start the system.' },
    { text: 'Every expedition begins with a click.' },
  ],
  fluent: [
    { text: 'Good weather for tackling what matters this morning.' },
    { text: 'Tidy your desk and clear your thoughts.' },
    { text: 'Step by step still counts as progress.' },
    { text: 'Leave space for good surprises.' },
    { text: 'Break big tasks into small wins.' },
    { text: 'Take a thirty-second break after a task. You have earned it.' },
    { text: 'Consistency beats a sprint.' },
    { text: 'Today does not need perfection, just progress.' },
  ],
  minimal: [
    { text: 'Less is more.', source: 'Ludwig Mies van der Rohe' },
    { text: 'Learning without thought is lost; thought without learning is perilous.', author: 'Confucius', source: 'Analects' },
    { text: 'Life is finite, but knowledge has no bounds.', author: 'Zhuangzi', source: 'Zhuangzi' },
    { text: 'A good day does not come twice; make this morning count.', author: 'Tao Yuanming', source: 'Miscellaneous Poems' },
    { text: 'You cannot see a mountain clearly when you are standing on it.', author: 'Su Shi', source: 'Written on the Wall of Xilin Temple' },
    { text: 'When the path ends, sit and watch the clouds rise.', author: 'Wang Wei', source: 'Retreat at Mount Zhongnan' },
    { text: 'Direction matters more than speed.' },
    { text: 'Finishing one task is harder than listing ten.' },
  ],
  pixel: [
    { text: 'Save point ready. You can always start again.' },
    { text: 'Today’s objective: advance one square.' },
    { text: 'Facing a boss? Check your inventory first.' },
    { text: 'Experience points come from the challenges you face.' },
    { text: 'Failure is a reload, not the end.' },
    { text: 'Hidden items are often one step farther.' },
    { text: 'Do not rush the ending; side quests are fun.' },
    { text: 'Press START to continue.', source: 'Arcade prompt' },
  ],
  bento: [
    { text: 'Begin with the hardest block.' },
    { text: 'Bring your attention back to the task at hand.' },
    { text: 'What you finish matters more than what you plan.' },
    { text: 'Empty space leaves room for thought.' },
    { text: 'Move one module forward at a time.' },
    { text: 'A good working rhythm is sustainable.' },
    { text: 'Record what you completed, not just what you hope to do.' },
    { text: 'Late nights are for wrapping up, not starting over.' },
  ],
}

export function quotesForTheme(themeId: ThemeId): Quote[] {
  return QUOTES[themeId] ?? []
}

/** 按日期取"每日一句"，同一天稳定 */
export function dailyQuoteIndex(themeId: ThemeId, extra: number, dateKey: string): number {
  const total = quotesForTheme(themeId).length + extra
  if (total <= 0) return 0
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) % 100000
  return hash % total
}
