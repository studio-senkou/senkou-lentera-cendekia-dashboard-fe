import {
  FileText,
  Folder,
  LayoutList,
  MessageSquareQuote,
  Newspaper,
  PanelsTopLeft,
  ShieldCheck,
  Trash,
  User,
  UserCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles: Array<string>
  ownerOnly?: boolean
}

export interface NavGroup {
  label: string
  items: Array<NavItem>
}

export const NAV_GROUPS: Array<NavGroup> = [
  {
    label: 'Utama',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: PanelsTopLeft,
        roles: ['admin', 'mentor'],
      },
    ],
  },
  {
    label: 'Manajemen Pengguna',
    items: [
      {
        title: 'Daftar Murid',
        url: '/users/students',
        icon: User,
        roles: ['admin'],
      },
      {
        title: 'Daftar Tentor',
        url: '/users/mentors',
        icon: UserCircle,
        roles: ['admin'],
      },
      {
        title: 'Kelola Admin',
        url: '/users/admins',
        icon: ShieldCheck,
        roles: ['admin'],
        ownerOnly: true,
      },
      {
        title: 'Pengguna Terhapus',
        url: '/users/deleted',
        icon: Trash,
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Pembelajaran',
    items: [
      {
        title: 'Kelas',
        url: '/classes',
        icon: Folder,
        roles: ['admin', 'mentor'],
      },
      {
        title: 'Kuis',
        url: '/quizzes',
        icon: FileText,
        roles: ['admin'],
      },
      {
        title: 'Sesi Pertemuan',
        url: '/meeting-sessions',
        icon: UserCircle,
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Website',
    items: [
      {
        title: 'Artikel',
        url: '/articles',
        icon: Newspaper,
        roles: ['admin'],
      },
      {
        title: 'Program',
        url: '/programs',
        icon: LayoutList,
        roles: ['admin'],
      },
      {
        title: 'Testimonial',
        url: '/testimonials',
        icon: MessageSquareQuote,
        roles: ['admin'],
      },
    ],
  },
]

export function getVisibleNavGroups(
  role: string | null | undefined,
  isOwner = false,
): Array<NavGroup> {
  if (!role) return []

  const normalizedRole = role.toLowerCase()

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.roles.includes(normalizedRole) &&
        (item.ownerOnly !== true || isOwner),
    ),
  })).filter((group) => group.items.length > 0)
}

export function getVisibleNavItems(
  role: string | null | undefined,
  isOwner = false,
): Array<NavItem> {
  return getVisibleNavGroups(role, isOwner).flatMap((group) => group.items)
}
