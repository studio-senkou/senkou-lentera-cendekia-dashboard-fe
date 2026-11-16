import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export interface QuestionTextAnswersFieldProps {
  answers: string[]
  error: string | null
  onAddAnswer: () => void
  onRemoveAnswer: (index: number) => void
  onAnswerChange: (index: number, val: string) => void
}

export function QuestionTextAnswersField({
  answers,
  error,
  onAddAnswer,
  onRemoveAnswer,
  onAnswerChange,
}: QuestionTextAnswersFieldProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            Kunci Jawaban Teks
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              Isian Singkat
            </span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Masukkan teks jawaban yang benar beserta variasinya (siswa harus
            mengetik teks yang cocok).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddAnswer}
          className="h-8 gap-1 rounded-lg text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Variasi
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        {answers.map((ans, idx) => (
          <div
            key={`text-ans-${idx}`}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
          >
            <span className="flex h-7 px-2 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
              {idx === 0 ? 'Kunci Utama' : `Variasi #${idx + 1}`}
            </span>
            <Input
              placeholder={
                idx === 0
                  ? 'Masukkan kunci jawaban teks utama...'
                  : 'Masukkan variasi jawaban lain yang diterima...'
              }
              value={ans}
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium"
            />
            {answers.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveAnswer(idx)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
