import { useState } from 'react'
import { Edit3, Trash2 } from 'lucide-react'

import EditClassSheet from './edit-class.sheet'
import { RowActions } from '@/widgets/table'
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

interface ClassActionsProps {
  id: number
  classname: string
  onEditSuccess?: () => void
  onDelete?: (id: number) => void
}

export function ClassActions({
  id,
  classname,
  onEditSuccess,
  onDelete,
}: ClassActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <RowActions
        actions={[
          {
            key: 'edit',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Edit3 className="h-4 w-4" />,
              label: 'Edit Kelas',
              onSelect: () => setEditOpen(true),
            },
          },
          {
            key: 'delete',
            node: null,
            alwaysOverflow: true,
            overflow: {
              icon: <Trash2 className="h-4 w-4" />,
              label: 'Hapus Kelas',
              variant: 'destructive',
              onSelect: () => setDeleteOpen(true),
            },
          },
        ]}
      />

      <EditClassSheet
        id={id}
        classname={classname}
        onSuccess={onEditSuccess}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kelas{' '}
              <strong>{classname}</strong> secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete?.(id)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ClassActions
