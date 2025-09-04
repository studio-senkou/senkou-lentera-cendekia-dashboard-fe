import { ArticleCard } from '@/widgets/article'
import { Tiptap } from '@/widgets/tiptap'
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
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useAppForm } from '@/shared/hooks/form'
import { useHeaderStore } from '@/shared/hooks/use-header'
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from '@/entities/articles'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'

export const Route = createFileRoute('/_authenticatedLayout/articles/')({
  loader: () => {
    const setTitle = useHeaderStore.getState().setTitle
    setTitle('Artikel')
  },
  component: RouteComponent,
})

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [editingArticle, setEditingArticle] = useState<any>(null)

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 5,
  })

  const form = useAppForm({
    defaultValues: {
      title: '',
      content: '',
    },
    validators: {
      onSubmit: blogSchema,
    },
    onSubmit: async (values) => {
      if (editingArticle) {
        await updateArticle(editingArticle.id, values.value)
        setEditingArticle(null)
      } else {
        await createArticle(values.value)
      }

      form.reset()
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })

  const {
    state: { values },
  } = form

  const handleEditArticle = (article: any) => {
    setEditingArticle(article)
    form.setFieldValue('title', article.title)
    form.setFieldValue('content', article.content)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingArticle(null)
    form.reset()
  }

  const { mutateAsync: deleteArticleMutation, isPending: deletingArticle } =
    useMutation({
      mutationFn: (articleID: number) => deleteArticle(articleID),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['articles'] })
      },
    })

  return (
    <div>
      <div className="max-w-4xl p-4">
        {editingArticle && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="text-blue-800 text-sm">
              Mengedit artikel: "{editingArticle.title}"
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="mb-4">
            <form.AppField name="title">
              {({ TextField }) => (
                <TextField
                  label="Judul Artikel"
                  placeholder="Masukkan judul artikel"
                  name="title"
                />
              )}
            </form.AppField>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editingArticle && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Batal
              </Button>
            )}
            <Button type="submit" className="px-4 py-2">
              {editingArticle ? 'Update Artikel' : 'Simpan Artikel'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Isi Artikel</label>
          <Tiptap
            value={values.content}
            onChange={(html) => form.setFieldValue('content', html)}
            placeholder="Tulis isi artikel di sini..."
            minHeight="400px"
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl p-4 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Daftar Artikel</h2>
        {loadingArticles ? (
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
          </div>
        ) : (
          <div className="space-y-4">
            {articles?.map((article) => (
              <div key={article.id} className="relative group">
                <ArticleCard
                  title={article.title}
                  content={article.content}
                  author={article.author}
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditArticle(article)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Do you really want to delete this article?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the article and all of its content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteArticleMutation(article.id)
                          }}
                        >
                          {deletingArticle && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Yes, Delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
