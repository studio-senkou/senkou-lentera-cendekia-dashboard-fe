import { describe, expect, it } from 'vitest'

import type { MeetingSession, User } from '@/shared/types/response'
import {
  EMPTY_MEETING_SESSION_FILTERS,
  countActiveMeetingSessionFilters,
  filterMeetingSessions,
} from './meeting-session-filters'
import type { MeetingSessionFilters } from './meeting-session-filters'

function makeUser(id: number, name: string): User {
  return {
    id,
    name,
    email: `${name.toLowerCase().replaceAll(' ', '.')}@test.local`,
    email_verified_at: '2026-01-01T00:00:00Z',
    is_active: true,
    is_owner: false,
    role: 'user',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
}

function makeSession(overrides: Partial<MeetingSession> = {}): MeetingSession {
  return {
    id: 1,
    session_date: '2026-03-15',
    session_time: '10:30:00',
    duration: 60,
    student_id: '1',
    student: makeUser(1, 'Budi Santoso'),
    mentor_id: '2',
    mentor: { ...makeUser(2, 'Siti Aminah'), role: 'mentor' },
    description: 'Algebra review session',
    note: 'Bring notebook',
    status: 'pending',
    subject: 'Algebra',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function withFilters(
  overrides: Partial<MeetingSessionFilters> = {},
): MeetingSessionFilters {
  return { ...EMPTY_MEETING_SESSION_FILTERS, ...overrides }
}

function run(
  rows: Array<MeetingSession>,
  filters: Partial<MeetingSessionFilters> = {},
  keyword = '',
) {
  return filterMeetingSessions(rows, {
    keyword,
    filters: withFilters(filters),
  })
}

describe('countActiveMeetingSessionFilters', () => {
  it('counts only non-blank fields', () => {
    expect(
      countActiveMeetingSessionFilters(EMPTY_MEETING_SESSION_FILTERS),
    ).toBe(0)
    expect(
      countActiveMeetingSessionFilters(
        withFilters({ student: 'Budi', date: '' }),
      ),
    ).toBe(1)
  })
})

describe('filterMeetingSessions', () => {
  const algebra = makeSession()
  const english = makeSession({
    id: 2,
    session_date: '2026-04-20',
    session_time: '14:00:00',
    duration: 90,
    student_id: '3',
    student: makeUser(3, 'Rina Wijaya'),
    mentor_id: '4',
    mentor: { ...makeUser(4, 'Andi Pratama'), role: 'mentor' },
    subject: 'English',
    description: 'Speaking practice',
    note: null,
  })

  it('returns every row when nothing is filtered', () => {
    const rows = [algebra, english]
    expect(run(rows)).toHaveLength(2)
  })

  it('filters by keyword across all fields', () => {
    const rows = [algebra, english]
    expect(run(rows, {}, 'speaking').map((row) => row.id)).toEqual([2])
  })

  it.each<[string, Partial<MeetingSessionFilters>, Array<number>]>([
    ['student', { student: 'rina' }, [2]],
    ['mentor', { mentor: 'SITI' }, [1]],
    ['subject', { subject: 'english' }, [2]],
    ['description', { description: 'algebra' }, [1]],
    ['date', { date: '2026-04-20' }, [2]],
    ['time', { time: '10:30' }, [1]],
    ['duration', { duration: '90' }, [2]],
  ])('filters by %s', (_label, filters, expectedIds) => {
    const rows = [algebra, english]
    const result = run(rows, filters)
    expect(result.map((row) => row.id)).toEqual(expectedIds)
  })

  it('returns no rows when a column filter matches nothing', () => {
    expect(run([algebra, english], { subject: 'math' })).toEqual([])
  })

  it('filters by note', () => {
    const rows = [algebra, english]
    expect(run(rows, { note: 'notebook' }).map((row) => row.id)).toEqual([1])
    expect(run(rows, { note: 'nothing' })).toEqual([])
  })

  it('combines filters as an intersection', () => {
    const rows = [algebra, english]
    expect(run(rows, { student: 'rina', subject: 'english' })).toHaveLength(1)
    expect(run(rows, { student: 'rina', subject: 'algebra' })).toEqual([])
  })

  it('falls back to the provided label map when the embedded user is missing', () => {
    const row = makeSession({
      student: null as unknown as User,
      mentor: null as unknown as User,
    })
    const result = filterMeetingSessions([row], {
      keyword: '',
      filters: withFilters({ student: 'Budi', mentor: 'Siti' }),
      studentNames: new Map([['1', 'Budi Santoso']]),
      mentorNames: new Map([['2', 'Siti Aminah']]),
    })
    expect(result).toHaveLength(1)
  })

  it('hides blank spreadsheet rows while a filter is active', () => {
    const blank = {
      id: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    } as unknown as MeetingSession

    expect(run([algebra, blank])).toHaveLength(2)
    expect(run([algebra, blank], { subject: 'algebra' })).toHaveLength(1)
    expect(run([algebra, blank], {}, 'algebra')).toHaveLength(1)
  })
})
