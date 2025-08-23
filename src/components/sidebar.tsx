import {
  // Bell,
  // CreditCard,
  // Database,
  DotSquare,
  // File,
  Folder,
  LogOut,
  PanelsTopLeft,
  // Paperclip,
  Share,
  Trash,
  User,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
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
} from './ui/sidebar'
// import { Button } from './ui/button'
import { createElement, type ComponentProps } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSessionStore } from '@/integrations/zustand/hooks/use-session'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/integrations/zustand/hooks/use-user'

const { name, email, role } = useUserStore.getState()

const data = {
  user: {
    name: name ?? '',
    email: email ?? '',
    role: role ?? '',
    avatar: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name ?? '')}`,
  },
  navigations: [
    {
      title: 'Dashboard',
      url: '/',
      icon: PanelsTopLeft,
      roles: ['admin', 'mentor'],
    },
    {
      title: 'Pengguna',
      url: '/users',
      icon: User,
      roles: ['admin'],
    },
    {
      title: 'Sesi Pertemuan',
      url: '/meeting-sessions',
      icon: UserCircle,
      roles: ['admin'],
    },
    {
      title: 'Pengaturan Profile Website',
      url: '/page-settings',
      icon: PanelsTopLeft,
      roles: ['admin'],
    },
    {
      title: 'Artikel',
      url: '/articles',
      icon: UserCircle,
      roles: ['admin', 'mentor'],
    },
  ],
  // documents: [
  //   {
  //     name: 'Data Library',
  //     url: '#',
  //     icon: Database,
  //   },
  //   {
  //     name: 'Reports',
  //     url: '#',
  //     icon: Paperclip,
  //   },
  //   {
  //     name: 'Word Assistant',
  //     url: '#',
  //     icon: File,
  //   },
  // ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navigations} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    roles: string[]
  }[]
}) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <CirclePlus />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <Mail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
          {items
            .filter((item) =>
              item.roles.includes((role as string)?.toLowerCase()),
            )
            // .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically
            .map((item) => (
              <SidebarMenuItem
                key={item.title}
                className={cn(pathname === item.url && 'bg-neutral-100')}
              >
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={item.url} preload={false} role="link">
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
}

// function NavSecondary({
//   items,
//   ...props
// }: {
//   items: {
//     title: string
//     url: string
//     icon: LucideIcon
//   }[]
// } & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
//   return (
//     <SidebarGroup {...props}>
//       <SidebarGroupContent>
//         <SidebarMenu>
//           {items.map((item) => (
//             <SidebarMenuItem key={item.title}>
//               <SidebarMenuButton asChild>
//                 <a href={item.url}>
//                   <item.icon />
//                   <span>{item.title}</span>
//                 </a>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarGroupContent>
//     </SidebarGroup>
//   )
// }

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
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
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <DotSquare className="text-sidebar-foreground/70" />
            <span>More</span>
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
  const { isMobile } = useSidebar()

  const logout = useSessionStore((state) => state.clearSession)

  const handleClearSession = async () => {
    await logout()

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
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleClearSession}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
