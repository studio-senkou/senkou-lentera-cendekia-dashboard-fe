import {
  DotSquare,
  FileText,
  Folder,
  LayoutList,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  PanelsTopLeft,
  Share,
  Trash,
  User,
  UserCircle,
} from 'lucide-react'
import { createElement } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { useSessionStore } from '@/shared/hooks/use-session'
import { cn } from '@/shared/lib/utils'
import { useUserStore } from '@/shared/hooks/use-user'

const NAV_GROUPS = [
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

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { name, email, role } = useUserStore()

  const user = {
    name: name ?? '',
    email: email ?? '',
    role: role ?? '',
    avatar: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name ?? '')}`,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Lentera Cendekia Logo"
                  className="h-8 w-8 rounded-lg"
                  loading="lazy"
                />
                <span className="text-base font-semibold">
                  Lentera Cendekia
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={NAV_GROUPS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function NavMain({
  groups,
}: {
  groups: Array<{
    label: string
    items: Array<{
      title: string
      url: string
      icon?: LucideIcon
      roles: Array<string>
    }>
  }>
}) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const role = useUserStore((state) => state.role)

  return (
    <>
      {groups.map((group) => {
        const visibleItems = group.items.filter((item) =>
          item.roles.includes((role as string).toLowerCase()),
        )
        if (visibleItems.length === 0) return null

        return (
          <SidebarGroup key={group.label}>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {visibleItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(pathname === item.url && 'bg-neutral-100')}
                  >
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={item.url}
                        preload={false}
                        role="link"
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                      >
                        {item.icon && createElement(item.icon)}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      })}
    </>
  )
}

export function NavDocuments({
  items,
}: {
  items: Array<{
    name: string
    url: string
    icon: LucideIcon
  }>
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Dokumen</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <DotSquare />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <Folder />
                  <span>Buka</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share />
                  <span>Bagikan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  <span>Hapus</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <DotSquare className="text-sidebar-foreground/70" />
            <span>Lainnya</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    role: string
    avatar: string
  }
}) {
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()

  const logout = useSessionStore((state) => state.clearSession)

  const handleClearSession = async () => {
    await logout()

    if (isMobile) setOpenMobile(false)
    navigate({
      to: '/login',
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <DotSquare className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearSession}>
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
