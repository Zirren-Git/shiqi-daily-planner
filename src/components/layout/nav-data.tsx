import {
  Calendar,
  CalendarClock,
  ListTodo,
  CheckSquare,
  ClipboardList,
  BarChart3,
  Settings,
  Inbox,
  Timer,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  id: 'flow' | 'record' | 'system'
  title: string
  items: NavItem[]
}

/**
 * 桌面侧边栏分组：主流程（每天真正在用的四件事）
 * → 记录（回看与统计）→ 系统（设置 / 收集箱）
 */
export const navGroups: NavGroup[] = [
  {
    id: 'flow',
    title: 'Plan',
    items: [
      { href: '/schedule', label: 'Schedule', icon: ListTodo },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
      { href: '/focus', label: 'Focus', icon: Timer },
      { href: '/habits', label: 'Habits', icon: CheckSquare },
    ],
  },
  {
    id: 'record',
    title: 'History',
    items: [
      { href: '/reviews/today', label: 'Daily review', icon: FileText },
      { href: '/reviews', label: 'Reviews', icon: ClipboardList },
      { href: '/insights', label: 'Insights', icon: BarChart3 },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/inbox', label: 'Inbox', icon: Inbox },
    ],
  },
]

// Mobile bottom nav: 5 main items + 「更多」抽屉，保证手机端能进到每一个页面
export const mobileNavItems: NavItem[] = [
  { href: '/schedule', label: 'Schedule', icon: ListTodo },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

/**
 * 手机底部导航放不下的页面。
 * 桌面有侧边栏能直达，手机如果没有这个入口，统计 / 复盘 / 每日总结
 * 就只能手打 URL 才能打开 —— 等于不存在。
 */
export const moreNavItems: NavItem[] = [
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/reviews', label: 'Reviews', icon: ClipboardList },
  { href: '/reviews/today', label: 'Daily review', icon: FileText },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/countdowns', label: 'Countdowns', icon: CalendarClock },
]
