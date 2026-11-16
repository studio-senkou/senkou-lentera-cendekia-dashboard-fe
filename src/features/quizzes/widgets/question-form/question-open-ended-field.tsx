import { FileText } from 'lucide-react'

export function QuestionOpenEndedField() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-2">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">
        <FileText className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900">
        Pertanyaan Esai / Jawaban Terbuka
      </h4>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
        Siswa akan mengetikkan jawaban bebas/paragraf saat kuis berlangsung.
        Tidak memerlukan pilihan ganda.
      </p>
    </div>
  )
}
