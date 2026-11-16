import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, FileJson, Loader2, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import { importQuizCalibration } from '@/entities/quizzes'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ImportCalibrationDialogProps {
  quizId: number
  trigger?: ReactNode
}

export function ImportCalibrationDialog({
  quizId,
  trigger,
}: ImportCalibrationDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [version, setVersion] = useState('v1.0-official')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.name.endsWith('.json') && !selected.name.endsWith('.csv')) {
      toast.error('Hanya file JSON atau CSV yang diperbolehkan')
      return
    }

    setFile(selected)
  }

  const handleDownloadTemplate = () => {
    const sampleData = {
      calibration_version: 'v2025.1-tka-resmi',
      items: [
        { question_id: 1, discrimination: 1.25, difficulty: -0.5 },
        { question_id: 2, discrimination: 1.0, difficulty: 0.2 },
        { question_id: 3, discrimination: 1.6, difficulty: 1.1 },
      ],
    }

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tka_calibration_template_${quizId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Silakan pilih file kalibrasi terlebih dahulu')
      return
    }

    try {
      setIsSubmitting(true)

      if (file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        await importQuizCalibration(quizId, {
          calibration_version: parsed.calibration_version || version,
          items: parsed.items || parsed,
        })
      } else {
        await importQuizCalibration(quizId, {
          calibration_version: version,
          file,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'questions'],
      })
      setOpen(false)
      setFile(null)
    } catch {
      // error handled in entity
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import IRT Calibration
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Import IRT 2PL Calibration Parameters
          </DialogTitle>
          <DialogDescription>
            Upload question discrimination (a) and difficulty (b) calibration
            parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="calibration-version">Calibration Version</Label>
            <Input
              id="calibration-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v2025.1-official"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="text-sm text-muted-foreground">
              Supported formats:{' '}
              <span className="font-medium text-foreground">.json</span> or{' '}
              <span className="font-medium text-foreground">.csv</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownloadTemplate}
              className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              <Download className="h-3.5 w-3.5" />
              Download Template
            </Button>
          </div>

          <div
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
              file
                ? 'border-emerald-500/50 bg-emerald-50/20'
                : 'border-muted-foreground/20 hover:border-emerald-500/40'
            }`}
          >
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            {file ? (
              <div className="flex items-center gap-3">
                <FileJson className="h-8 w-8 text-emerald-600" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop file or click to select
                </p>
                <p className="text-xs text-muted-foreground">Maximum 5MB</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Import Calibration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
