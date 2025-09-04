import { Skeleton } from '@/shared/ui/skeleton'

export const MeetingDataSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 bg-gray-100/40 p-4 rounded-lg">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={`spreadsheet-skeleton-${index}`}
          className="h-8 w-full"
        />
      ))}
    </div>
  )
}
