/** @vitest-environment jsdom */
import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormSheet } from './form-sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(true)}>edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Test"
        description="desc"
      >
        <button type="button">inside</button>
      </FormSheet>
    </div>
  )
}

describe('debug', () => {
  it('reports pointer events', async () => {
    render(<Harness />)

    fireEvent.keyDown(screen.getByText('menu'), { key: 'Enter' })

    const item = await screen.findByText('edit')
    fireEvent.click(item)

    const content = await screen.findByTestId('shared-drawer-common-root')
    await waitFor(() => expect(content).toBeTruthy())

    console.log('body pointerEvents:', document.body.style.pointerEvents)
    console.log('content inline style:', content.getAttribute('style'))
    console.log('content computed:', window.getComputedStyle(content).pointerEvents)
    console.log('dropdown still in dom:', !!screen.queryByText('edit'))
  })
})
