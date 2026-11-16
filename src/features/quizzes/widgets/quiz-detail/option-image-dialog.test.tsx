/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { OptionImageDialog } from './option-image-dialog'

vi.mock('@/shared/lib/utils', () => ({
  cn: (...inputs: Array<unknown>) => inputs.filter(Boolean).join(' '),
  getFileUrl: (path?: string | null) =>
    path ? `https://cdn.example.com/${path}` : undefined,
}))

describe('OptionImageDialog', () => {
  it('shows only the thumbnail until it is clicked', () => {
    render(<OptionImageDialog imagePath="tenants/x/answer.png" letter="A" />)

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(
      screen.getByRole('button', { name: /perbesar gambar pilihan a/i }),
    ).toBeTruthy()
  })

  it('opens a dialog with the full image when the thumbnail is clicked', () => {
    render(
      <OptionImageDialog
        imagePath="tenants/x/answer.png"
        letter="B"
        optionText="Jawaban B"
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /perbesar gambar pilihan b/i }),
    )

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Gambar pilihan B')).toBeTruthy()
    expect(screen.getByText('Jawaban B')).toBeTruthy()

    // Radix hides the rest of the page while the dialog is open, so only the
    // dialog's full-size image is exposed to assistive tech.
    const images = screen.getAllByRole('img', { name: 'Gambar pilihan B' })
    expect(images).toHaveLength(1)
    expect(images[0]?.getAttribute('src')).toBe(
      'https://cdn.example.com/tenants/x/answer.png',
    )
  })
})
