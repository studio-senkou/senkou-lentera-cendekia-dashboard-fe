import type { ReactNode } from 'react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import {
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { importQuizQuestions } from '@/entities/quizzes'
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

interface ImportQuestionsDialogProps {
  quizId: number
  trigger?: ReactNode
}

export function ImportQuestionsDialog({ quizId, trigger }: ImportQuestionsDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (
      !selected.name.endsWith('.xlsx') &&
      !selected.type.includes('spreadsheetml')
    ) {
      toast.error('Hanya file Excel (.xlsx) yang diperbolehkan')
      return
    }

    setFile(selected)
  }

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Questions')

    worksheet.columns = [
      { header: 'question', key: 'question', width: 35 },
      { header: 'answer_a', key: 'answer_a', width: 22 },
      { header: 'answer_b', key: 'answer_b', width: 22 },
      { header: 'answer_c', key: 'answer_c', width: 22 },
      { header: 'answer_d', key: 'answer_d', width: 22 },
      { header: 'answer_e', key: 'answer_e', width: 22 },
      { header: 'true_answer', key: 'true_answer', width: 15 },
    ]

    // Style headers
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    }

    // Add sample rows
    worksheet.addRow({
      question: 'Apa ibukota negara Indonesia saat ini?',
      answer_a: 'Jakarta',
      answer_b: 'Surabaya',
      answer_c: 'Bandung',
      answer_d: 'Medan',
      answer_e: 'Semarang',
      true_answer: 'a',
    })

    worksheet.addRow({
      question: 'Berapakah hasil dari 12 x 12?',
      answer_a: '124',
      answer_b: '144',
      answer_c: '154',
      answer_d: '164',
      answer_e: '134',
      true_answer: 'b',
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'quiz-questions-template.xlsx')
    toast.success('Template kuis berhasil diunduh')
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Pilih file Excel terlebih dahulu')
      return
    }

    setIsSubmitting(true)
    try {
      await importQuizQuestions(quizId, file)
      await queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      await queryClient.invalidateQueries({
        queryKey: ['quiz', quizId, 'questions'],
      })
      await queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      setFile(null)
      setOpen(false)
    } catch {
      // Error handled by entity toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="gap-2 rounded-full border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 p-6"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import Soal (.xlsx)
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-2xl!'>
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-medium gap-2">
            Import Soal dari File Excel (.xlsx)
          </DialogTitle>
          <DialogDescription>
            Unggah file Excel berisi daftar pertanyaan dan pilihan jawaban
            sekaligus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format Reference Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">
                Format Kolom Excel Wajib:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-7 gap-1 text-xs text-primary font-medium hover:text-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Template (.xlsx)
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-2xs">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="px-2.5 py-1.5">question</th>
                    <th className="px-2.5 py-1.5">answer_a</th>
                    <th className="px-2.5 py-1.5">answer_b</th>
                    <th className="px-2.5 py-1.5">answer_c</th>
                    <th className="px-2.5 py-1.5">answer_d</th>
                    <th className="px-2.5 py-1.5">...</th>
                    <th className="px-2.5 py-1.5 text-emerald-700">true_answer</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600 font-mono">
                  <tr>
                    <td className="px-2.5 py-1.5">Soal kuis...</td>
                    <td className="px-2.5 py-1.5">Pilihan A</td>
                    <td className="px-2.5 py-1.5">Pilihan B</td>
                    <td className="px-2.5 py-1.5">Pilihan C</td>
                    <td className="px-2.5 py-1.5">Pilihan D</td>
                    <td className="px-2.5 py-1.5">...</td>
                    <td className="px-2.5 py-1.5 font-bold text-emerald-600">a</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground">
              * Kolom <code className="font-semibold text-emerald-700">true_answer</code> diisi huruf jawaban yang benar (<code className="font-semibold">a</code>, <code className="font-semibold">b</code>, <code className="font-semibold">c</code>, dst).
            </p>
          </div>

          {/* File Picker / Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Pilih Dokumen Excel
            </label>

            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={isSubmitting}
                  className="text-slate-500 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all">
                <UploadCloud className="h-9 w-9 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Klik untuk memilih file Excel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Format file harus berekstensi .xlsx
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Mengimpor Soal...
              </>
            ) : (
              'Mulai Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
