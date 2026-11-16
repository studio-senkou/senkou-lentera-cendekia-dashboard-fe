import { Maximize2 } from 'lucide-react'

import { cn, getFileUrl } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

export interface OptionImageDialogProps {
  imagePath: string
  letter?: string
  optionText?: string | null
  thumbnailClassName?: string
}

/**
 * Renders an answer image thumbnail that opens the full-size image in a
 * dialog when clicked.
 */
export function OptionImageDialog({
  imagePath,
  letter,
  optionText,
  thumbnailClassName,
}: OptionImageDialogProps) {
  const src = getFileUrl(imagePath)
  if (!src) return null

  const title = letter ? `Gambar pilihan ${letter}` : 'Gambar pilihan'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Perbesar ${title.toLowerCase()}`}
          className="group relative block cursor-zoom-in overflow-hidden rounded-md border border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
        >
          <img src={src} alt={title} className={cn(thumbnailClassName)} />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
            <Maximize2 className="h-4 w-4 text-white" />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {optionText ? (
            <DialogDescription>{optionText}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2">
          <img
            src={src}
            alt={title}
            className="max-h-[68vh] w-auto max-w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
