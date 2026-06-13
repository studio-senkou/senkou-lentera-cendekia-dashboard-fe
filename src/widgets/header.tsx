// import { Link } from '@tanstack/react-router'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'

export default function Header() {
  const title = useHeaderStore((state) => state.title)

  return (
    <header className="flex h-[64px] shrink-0 items-center gap-2 border-b border-border bg-white/90 backdrop-blur-[20px] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[64px] sticky top-0 z-10">
      <div className="flex w-full items-center gap-1 px-6 sm:px-12 lg:px-16 mx-auto">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium text-foreground">{title}</h1>
      </div>
    </header>
  )
}
