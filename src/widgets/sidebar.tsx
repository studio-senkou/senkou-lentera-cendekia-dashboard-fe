import { LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { getVisibleNavGroups } from './sidebar.nav'
import type { NavGroup } from './sidebar.nav'
import type { ComponentProps } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
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
import { useUserStore } from '@/shared/hooks/use-user'
import { cn } from '@/shared/lib/utils'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { name, email, role, isOwner } = useUserStore()

  const user = {
    name: name ?? '',
    email: email ?? '',
    role: role ?? '',
    avatar: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name ?? '')}`,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-0">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link
            to="/"
            className="flex items-center gap-2 overflow-hidden"
            title="Lentera Cendekia"
          >
            <img
              src="/logo.png"
              alt="Lentera Cendekia Logo"
              className="size-12 shrink-0 rounded-lg"
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-8">
        <NavMain groups={getVisibleNavGroups(role, isOwner)} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function NavMain({ groups }: { groups: Array<NavGroup> }) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  const isActive = (url: string) =>
    url === '/'
      ? pathname === '/'
      : pathname === url || pathname.startsWith(`${url}/`)

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label} className="py-0">
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                >
                  <Link
                    to={item.url}
                    preload={false}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false)
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
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
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0) || 'LC'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <LogOut className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              'w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg',
            )}
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0) || 'LC'}
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
