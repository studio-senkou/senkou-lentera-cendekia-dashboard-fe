export interface ProgramCardProps {
  title: string
  description: string
  image_url: string | null
}

export function ProgramCard({ title, description, image_url }: ProgramCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white border border-neutral-200 shadow-sm rounded-lg p-6">
      {image_url && (
        <div className="w-full md:w-48 h-32 flex-shrink-0">
          <img src={image_url} alt={title} className="w-full h-full object-cover rounded-md border border-neutral-100" />
        </div>
      )}
      <div className="flex flex-col justify-start">
        <h2 className="text-2xl font-semibold font-lora text-orange-900 underline">{title}</h2>
        <div className="mt-2 line-clamp-5 text-sm text-neutral-800 whitespace-pre-wrap">{description}</div>
      </div>
    </div>
  )
}
