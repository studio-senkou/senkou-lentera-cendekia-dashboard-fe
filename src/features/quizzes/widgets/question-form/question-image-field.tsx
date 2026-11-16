import { useId, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'

import { FormField } from '@/shared/ui/form-field'

export interface QuestionImageFieldProps {
  imagePreview: string | null
  imageError: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  label?: string
  hint?: string
  alt?: string
  required?: boolean
}

export function QuestionImageField({
  imagePreview,
  imageError,
  onFileChange,
  onClear,
  label = 'Gambar Soal',
  hint = '(opsional, maks. 2 MB)',
  alt = 'Preview gambar soal',
  required = false,
}: QuestionImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      error={imageError ?? undefined}
      secondaryLabel={
        <span className="text-xs font-normal text-slate-400">{hint}</span>
      }
    >
      {imagePreview ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          <img
            src={imagePreview}
            alt={alt}
            className="h-44 w-full object-contain bg-slate-50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white hover:bg-black/80 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-slate-50 py-6 text-sm text-muted-foreground hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <ImagePlus className="h-6 w-6 opacity-40" />
          <span>Klik untuk mengunggah gambar pendukung</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </FormField>
  )
}
