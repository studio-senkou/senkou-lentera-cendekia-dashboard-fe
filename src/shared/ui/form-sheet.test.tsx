/** @vitest-environment jsdom */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormSheet } from './form-sheet'

function RenderProp({ children }: { children: (value: string) => ReactNode }) {
  return <>{children('ok')}</>
}

describe('FormSheet', () => {
  it('does not break render-prop children', () => {
    render(
      <FormSheet
        open
        onOpenChange={() => {}}
        title="Test"
        description="FormSheet test"
      >
        <form>
          <RenderProp>
            {(value) => <span data-testid="child">{value}</span>}
          </RenderProp>
        </form>
      </FormSheet>,
    )

    expect(screen.getByTestId('child').textContent).toBe('ok')
  })
})
