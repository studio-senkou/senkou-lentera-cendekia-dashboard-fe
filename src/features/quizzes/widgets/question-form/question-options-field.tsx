import { Check, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import {
  OPTION_LETTERS,
  type ChoiceQuestionType,
  type DraftOption,
} from '@/features/quizzes/types'

export interface QuestionOptionsFieldProps {
  questionType: ChoiceQuestionType
  options: DraftOption[]
  error: string | null
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onOptionTextChange: (index: number, text: string) => void
  onOptionImageChange: (index: number, file: File | null) => void
  onClearOptionImage: (index: number) => void
  onToggleCorrect: (index: number) => void
}

export function QuestionOptionsField({
  questionType,
  options,
  error,
  onAddOption,
  onRemoveOption,
  onOptionTextChange,
  onOptionImageChange,
  onClearOptionImage,
  onToggleCorrect,
}: QuestionOptionsFieldProps) {
  const isRadio = questionType === 'multiple_choice'
  const isPoll = questionType === 'poll'

  return (
    <div className="space-y-4 rounded-xl border border-border bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            Pilihan Jawaban
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                questionType === 'multiple_choice' &&
                  'bg-blue-100 text-blue-800',
                questionType === 'checkbox' && 'bg-purple-100 text-purple-800',
                questionType === 'poll' && 'bg-slate-200 text-slate-700',
              )}
            >
              {questionType === 'multiple_choice' &&
                'Pilihan Ganda (1 Jawaban)'}
              {questionType === 'checkbox' && 'Kotak Centang (Bisa >1 Jawaban)'}
              {questionType === 'poll' && 'Jajak Pendapat (Survei)'}
            </span>
          </h4>
          <p className="text-xs text-muted-foreground">
            {questionType === 'multiple_choice' &&
              'Pilih tepat 1 huruf radio sebagai kunci jawaban benar.'}
            {questionType === 'checkbox' &&
              'Pilih satu atau lebih kunci jawaban benar (Kotak Centang).'}
            {questionType === 'poll' &&
              'Masukkan opsi polling siswa. Tidak ada kunci jawaban benar atau salah.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Isi teks atau unggah gambar pada tiap pilihan — salah satu cukup.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddOption}
          className="h-8 gap-1 rounded-lg text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Pilihan
        </Button>
      </div>

      {/* Quick True Answer selector (only for graded questions) */}
      {!isPoll && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3">
          <span className="text-xs font-bold text-slate-700 mr-1">
            Kunci Jawaban Benar:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {options.map((opt, idx) => {
              const letter = OPTION_LETTERS[idx] || String(idx + 1)
              const isSelected = opt.is_correct
              return (
                <Button
                  key={`quick-key-${opt.id}`}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleCorrect(idx)}
                  className="h-7 min-w-8 px-2 text-xs font-bold"
                >
                  {letter} {isSelected && (isRadio ? '●' : '✓')}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const letter = OPTION_LETTERS[idx] || String(idx + 1)
          return (
            <div
              key={opt.id}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border p-2.5 transition-all',
                opt.is_correct
                  ? isRadio
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30'
                    : 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              {/* Selector indicator: radio vs checkbox vs poll letter */}
              {!isPoll ? (
                <button
                  type="button"
                  onClick={() => onToggleCorrect(idx)}
                  title={`Tandai pilihan ${letter} sebagai jawaban benar`}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold transition-all cursor-pointer rounded-sm',
                    opt.is_correct
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'border border-input bg-card text-muted-foreground hover:border-slate-400',
                  )}
                >
                  {opt.is_correct ? (
                    isRadio ? (
                      <span className="text-[10px]">●</span>
                    ) : (
                      <Check className="h-4 w-4 stroke-[3]" />
                    )
                  ) : (
                    letter
                  )}
                </button>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                  {letter}
                </span>
              )}

              <Input
                placeholder={
                  opt.imagePreview && opt.text.trim().length === 0
                    ? 'Teks opsional (gambar sudah diunggah)'
                    : isPoll
                      ? `Opsi ${letter}...`
                      : `Pilihan ${letter}...`
                }
                value={opt.text}
                onChange={(e) => onOptionTextChange(idx, e.target.value)}
                className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium"
              />

              {!isPoll &&
                (opt.is_correct ? (
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={() => onToggleCorrect(idx)}
                    className="h-6 gap-1 px-2 text-xs font-bold"
                  >
                    <Check className="size-3 stroke-[3]" />
                    Benar ({letter})
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleCorrect(idx)}
                    className="hidden sm:inline-flex h-6 px-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Pilih {letter}
                  </Button>
                ))}

              {opt.imagePreview ? (
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-slate-200">
                  <img
                    src={opt.imagePreview}
                    alt={`Gambar pilihan ${letter}`}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onClearOptionImage(idx)}
                    className="absolute -top-1 -right-1 size-4 rounded-full bg-black/70 text-white hover:bg-black/90 p-0"
                    title="Hapus gambar"
                  >
                    <X className="size-2.5" />
                  </Button>
                </div>
              ) : (
                <label
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary hover:text-primary"
                  title={`Tambah gambar pilihan ${letter}`}
                >
                  <ImagePlus className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      onOptionImageChange(idx, e.target.files?.[0] ?? null)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveOption(idx)}
                disabled={options.length <= 2}
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
