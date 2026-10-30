import { TopbarSearch } from './topbar-search'

import { SidebarTrigger } from '@/shared/ui/sidebar'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-card/85 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-2 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <TopbarSearch />
      </div>
    </header>
  )
}
