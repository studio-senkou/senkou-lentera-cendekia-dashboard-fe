import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'

import { getVisibleNavItems } from './sidebar.nav'
import type { NavItem } from './sidebar.nav'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Kbd } from '@/shared/ui/kbd'
import { cn } from '@/shared/lib/utils'
import { useUserStore } from '@/shared/hooks/use-user'

export function TopbarSearch() {
  const navigate = useNavigate()
  const role = useUserStore((state) => state.role)
  const isOwner = useUserStore((state) => state.isOwner)

  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const items = useMemo(
    () => getVisibleNavItems(role, isOwner),
    [role, isOwner],
  )

  const results = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    if (!query) return []

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query),
    )
  }, [items, keyword])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) setKeyword('')
  }, [open])

  useEffect(() => {
    setFocusedIndex(results.length > 0 ? 0 : -1)
  }, [results])

  const goTo = useCallback(
    (item: NavItem) => {
      setOpen(false)
      navigate({ to: item.url })
    },
    [navigate],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length === 0) return

      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        event.preventDefault()
        setFocusedIndex((index) => (index + 1) % results.length)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex((index) =>
          index <= 0 ? results.length - 1 : index - 1,
        )
      }

      if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault()
        goTo(results[focusedIndex])
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    },
    [focusedIndex, goTo, results],
  )

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        aria-label="Cari menu"
        className="h-9 w-full max-w-xs justify-start gap-2 px-3 font-normal text-muted-foreground"
      >
        <SearchIcon className="size-4" />
        <span className="truncate">Cari menu...</span>
        <Kbd className="ml-auto hidden sm:inline-flex">Ctrl + K</Kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[calc(100vh-6rem)] max-h-[600px] flex-col gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="border-b px-4 py-3">
            <div className="relative">
              <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                autoFocus
                className="pl-9"
                placeholder="Cari menu..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Cari halaman atau menu yang tersedia.
          </DialogDescription>

          <div className="flex-1 overflow-y-auto p-2">
            {!keyword.trim() && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Ketik untuk mencari menu.
              </p>
            )}

            {keyword.trim() && results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Menu tidak ditemukan.
              </p>
            )}

            {results.map((item, index) => (
              <button
                key={item.url}
                type="button"
                onClick={() => goTo(item)}
                onMouseEnter={() => setFocusedIndex(index)}
                data-focused={focusedIndex === index}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors',
                  'hover:bg-muted data-[focused=true]:bg-muted',
                )}
              >
                <item.icon className="size-4 text-muted-foreground" />
                <span className="flex flex-col">
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.url}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
