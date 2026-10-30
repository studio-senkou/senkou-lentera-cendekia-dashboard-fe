import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { BookText, Check, Loader2, ScrollText, Trash2 } from 'lucide-react'

import type { User } from '@/shared/types/response'
import type { RowAction } from '@/widgets/table'
import { RowActions } from '@/widgets/table'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

interface UserRowActionsProps {
  user: User
  activateLabel?: string
  activateDescription?: string
  showSessions?: boolean
  showReport?: boolean
  canDelete?: boolean
  isActivating?: boolean
  activatingId?: number | null
  isDeleting?: boolean
  deletingId?: number | null
  onActivate: (id: number) => void
  onDelete?: (id: number) => void
}

/**
 * User table actions: navigation stays inline, everything else lives in the
 * row's overflow menu.
 */
export function UserRowActions({
  user,
  activateLabel = 'Aktifkan Pengguna',
  activateDescription = 'Tindakan ini akan mengaktifkan akun pengguna dan memperbarui datanya di server kami.',
  showSessions = false,
  showReport = false,
  canDelete = true,
  isActivating = false,
  activatingId = null,
  isDeleting = false,
  deletingId = null,
  onActivate,
  onDelete,
}: UserRowActionsProps) {
  const navigate = useNavigate()
  const [activateOpen, setActivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isActive = !!user.email_verified_at && !!user.is_active
  const isStudent = user.role === 'user'

  const openSessions = () =>
    navigate({
      to: '/meeting-sessions/$user',
      params: { user: user.id.toString() },
    })

  const openReport = () => window.open(`/report/${user.id}`, '_blank')

  const actions: Array<RowAction> = [
    ...(showSessions && isStudent
      ? [
          {
            key: 'sessions',
            node: (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    aria-label="Sesi Meeting Murid"
                    onClick={openSessions}
                  >
                    <BookText />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sesi Meeting Murid</p>
                </TooltipContent>
              </Tooltip>
            ),
            overflow: {
              icon: <BookText className="h-4 w-4" />,
              label: 'Sesi Meeting Murid',
              onSelect: openSessions,
            },
          },
        ]
      : []),
    ...(showReport && isStudent
      ? [
          {
            key: 'report',
            node: (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Lihat Halaman Laporan Publik"
                    onClick={openReport}
                  >
                    <ScrollText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lihat Halaman Laporan Publik</p>
                </TooltipContent>
              </Tooltip>
            ),
            overflow: {
              icon: <ScrollText className="h-4 w-4" />,
              label: 'Lihat Halaman Laporan Publik',
              onSelect: openReport,
            },
          },
        ]
      : []),
    {
      key: 'activate',
      node: null,
      alwaysOverflow: true,
      hidden: isActive,
      overflow: {
        icon: <Check className="h-4 w-4" />,
        label: activateLabel,
        onSelect: () => setActivateOpen(true),
      },
    },
    ...(canDelete
      ? [
          {
            key: 'delete',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Trash2 className="h-4 w-4" />,
              label: 'Hapus Pengguna',
              variant: 'destructive' as const,
              onSelect: () => setDeleteOpen(true),
            },
          },
        ]
      : []),
  ]

  return (
    <>
      <RowActions actions={actions} />

      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              {activateDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onActivate(user.id)}
              disabled={isActivating && activatingId === user.id}
            >
              {isActivating && activatingId === user.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canDelete && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Data pengguna{' '}
                <strong>{user.name}</strong> akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete?.(user.id)}
                disabled={isDeleting && deletingId === user.id}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && deletingId === user.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
