import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import '../app/styles.css'

function Harness() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: 40 }}>
      <button id="outside" onClick={() => setCount((c) => c + 1)}>
        outside {count}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button id="menu-trigger">menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem id="edit-item" onClick={() => setOpen(true)}>
            edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Edit Program"
        description="desc"
        trigger={<Button id="add">add</Button>}
      >
        <form>
          <input id="field" placeholder="title" />
          <button id="inner" type="button" onClick={() => setCount((c) => c + 1)}>
            inner {count}
          </button>
        </form>
      </FormSheet>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
