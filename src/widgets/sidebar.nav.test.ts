import { describe, expect, it } from 'vitest'

import { getVisibleNavGroups, getVisibleNavItems } from './sidebar.nav'

describe('owner-only navigation', () => {
  it('shows admin management to a tenant owner', () => {
    const items = getVisibleNavItems('admin', true)

    expect(items.some((item) => item.url === '/users/admins')).toBe(true)
  })

  it('hides admin management from a non-owner admin', () => {
    const items = getVisibleNavItems('admin', false)

    expect(items.some((item) => item.url === '/users/admins')).toBe(false)
  })

  it('does not expose the owner-only item to mentors', () => {
    const groups = getVisibleNavGroups('mentor', true)

    expect(
      groups.some((group) =>
        group.items.some((item) => item.url === '/users/admins'),
      ),
    ).toBe(false)
  })
})
