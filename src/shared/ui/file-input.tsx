import { useStore } from '@tanstack/react-form'
import { useFieldContext } from '../hooks/form-context'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Upload, X, File } from 'lucide-react'
import { useRef, useState } from 'react'

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 text-sm"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function FileInput({
  label,
  name,
  accept,
  multiple = false,
  required = false,
  maxSize,
  placeholder = 'Pilih file atau drag & drop di sini',
}: {
  label: string
  name: string
  accept?: string
  multiple?: boolean
  required?: boolean
  maxSize?: number // in bytes
  placeholder?: string
}) {
  const field = useFieldContext<File | File[] | null>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFileSize = (file: File) => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }
    return null
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      field.handleChange(multiple ? [] : null)
      return
    }

    const fileArray = Array.from(files)

    // Validate file sizes
    for (const file of fileArray) {
      const sizeError = validateFileSize(file)
      if (sizeError) {
        // You might want to handle this error differently
        console.error(sizeError)
        return
      }
    }

    if (multiple) {
      const currentFiles = (field.state.value as File[]) || []
      field.handleChange([...currentFiles, ...fileArray])
    } else {
      field.handleChange(fileArray[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileChange(e.dataTransfer.files)
  }

  const removeFile = (indexToRemove: number) => {
    if (multiple) {
      const currentFiles = (field.state.value as File[]) || []
      const newFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove,
      )
      field.handleChange(newFiles.length > 0 ? newFiles : [])
    } else {
      field.handleChange(null)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const currentFiles = multiple
    ? (field.state.value as File[]) || []
    : field.state.value
      ? [field.state.value as File]
      : []

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
        {maxSize && (
          <span className="text-sm text-muted-foreground ml-2">
            (Max: {formatFileSize(maxSize)})
          </span>
        )}
      </Label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id={name}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        onBlur={field.handleBlur}
        required={required}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }
          ${currentFiles.length > 0 ? 'bg-muted/20' : 'bg-background'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
          <p className="text-xs text-muted-foreground">
            {accept && `Supported formats: ${accept}`}
          </p>
        </div>
      </div>

      {/* Selected files list */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected files:</Label>
          {currentFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
