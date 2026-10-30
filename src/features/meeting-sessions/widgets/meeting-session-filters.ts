import type { MeetingSession } from '@/shared/types/response'

export interface MeetingSessionFilters {
  student: string
  mentor: string
  subject: string
  description: string
  date: string
  time: string
  duration: string
  note: string
}

export const EMPTY_MEETING_SESSION_FILTERS: MeetingSessionFilters = {
  student: '',
  mentor: '',
  subject: '',
  description: '',
  date: '',
  time: '',
  duration: '',
  note: '',
}

export function countActiveMeetingSessionFilters(
  filters: MeetingSessionFilters,
): number {
  return Object.values(filters).filter((value) => value.trim() !== '').length
}

export interface MeetingSessionFilterOptions {
  keyword: string
  filters: MeetingSessionFilters
  /** `student_id` → display name, used when the row has no embedded student. */
  studentNames?: Map<string, string>
  /** `mentor_id` → display name, used when the row has no embedded mentor. */
  mentorNames?: Map<string, string>
}

function contains(value: unknown, term: string): boolean {
  const needle = term.trim().toLowerCase()
  return (
    needle === '' ||
    String(value ?? '')
      .toLowerCase()
      .includes(needle)
  )
}

/**
 * Applies the free-text search together with the per-column filters.
 * Blank spreadsheet rows (no `id`) are hidden as soon as anything is filtered.
 */
export function filterMeetingSessions(
  rows: Array<MeetingSession>,
  options: MeetingSessionFilterOptions,
): Array<MeetingSession> {
  const query = options.keyword.trim().toLowerCase()
  const { filters } = options
  const hasColumnFilters = countActiveMeetingSessionFilters(filters) > 0
  const hasFilters = query !== '' || hasColumnFilters

  return rows.filter((row) => {
    if (hasFilters && !row.id) return false

    if (
      query !== '' &&
      !Object.values(row).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      )
    ) {
      return false
    }

    if (!hasColumnFilters) return true

    const studentName =
      row.student?.name ??
      options.studentNames?.get(String(row.student_id)) ??
      ''
    const mentorName =
      row.mentor?.name ?? options.mentorNames?.get(String(row.mentor_id)) ?? ''

    if (!contains(studentName, filters.student)) return false
    if (!contains(mentorName, filters.mentor)) return false
    if (!contains(row.subject, filters.subject)) return false
    if (!contains(row.description, filters.description)) return false
    if (
      filters.date.trim() !== '' &&
      String(row.session_date ?? '').slice(0, 10) !== filters.date
    ) {
      return false
    }
    if (
      filters.time.trim() !== '' &&
      String(row.session_time ?? '').slice(0, 5) !== filters.time
    ) {
      return false
    }
    if (
      filters.duration.trim() !== '' &&
      String(row.duration ?? '') !== filters.duration.trim()
    ) {
      return false
    }
    if (!contains(row.note, filters.note)) return false

    return true
  })
}
