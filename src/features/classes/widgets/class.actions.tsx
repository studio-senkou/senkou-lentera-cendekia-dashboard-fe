import { Trash2 } from 'lucide-react'
import EditClassSheet from './edit-class.sheet'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  return (
    <div className="flex items-center justify-end gap-2">
      <EditClassSheet id={id} classname={classname} onSuccess={onEditSuccess} />

      <TooltipProvider>
        <Tooltip>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="Hapus Kelas"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </AlertDialogTrigger>
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
          <TooltipContent>
            <p>Hapus Kelas</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default ClassActions
