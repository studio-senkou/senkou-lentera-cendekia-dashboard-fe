import type { User } from '@/shared/types/response'

export interface ArticleCardProps {
  title: string
  content: string
  author: User
}

export function ArticleCard({ title, content, author }: ArticleCardProps) {
  return (
    <div className="flex flex-col justify-center items-start rounded-md py-4">
      <h2 className="text-2xl font-semibold font-lora text-orange-900 underline">{title}</h2>
      <p className="flex space-x-1 items-center text-sm text-neutral-800 mt-2">
        <span className='font-lora text-md'>By </span>
        <span className='font-semibold text-lg'>{author.role === "admin" ? "Lentera Cendekia" : author.name}</span>
      </p>
      <div className="mt-2 line-clamp-5" dangerouslySetInnerHTML={{ __html: content }}/>
    </div>
  )
}
