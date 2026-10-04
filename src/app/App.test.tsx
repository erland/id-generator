import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App layout', () => {
  it('renders the responsive workspace landmarks', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /generera värden lokalt/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /kategorier/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UUID v4' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /genererade värden/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^generera$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /kopiera alla/i })).toBeInTheDocument()
  })

  it('copies one result and shows feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /kopiera värde 1/i }))

    expect(await screen.findByText('Kopierat')).toHaveTextContent('Kopierat')
    expect(writeText).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
  })

  it('generates a batch of five and Copy all preserves one value per line', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Antal'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))

    expect(await screen.findByRole('heading', { name: 'Genererade värden (5)' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /kopiera värde/i })).toHaveLength(5)

    fireEvent.click(screen.getByRole('button', { name: /kopiera alla/i }))
    await screen.findByText('Kopierade 5 värden')

    const copied = writeText.mock.calls.at(-1)?.[0] as string
    expect(copied.split('\n')).toHaveLength(5)
    expect(copied.endsWith('\n')).toBe(false)
  })

  it('offers the required batch count presets', () => {
    render(<App />)
    const countSelect = screen.getByLabelText('Antal')
    const options = Array.from(countSelect.querySelectorAll('option')).map((option) => option.textContent)
    expect(options).toEqual(['1', '5', '10', '100'])
  })

  it('provides a compact category selector for mobile layouts', () => {
    render(<App />)

    expect(screen.getByLabelText('Kategori')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Identifierare' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Secrets' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Hash' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Nycklar' })).toBeInTheDocument()
  })
})

describe('Accessibility', () => {
  it('provides a skip link and named main content target', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Hoppa till innehållet' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('does not expose not-yet-wired generators and categories as actionable controls', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /Secrets/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Hash/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Nycklar/i })).toBeDisabled()
    expect(screen.getByRole('option', { name: /UUID v7/i })).toBeDisabled()
    expect(screen.getByRole('option', { name: /ULID/i })).toBeDisabled()
    expect(screen.getByRole('option', { name: /NanoID/i })).toBeDisabled()
  })

  it('announces generation feedback without making the full result list a live region', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))

    expect(await screen.findByText('1 värde genererat')).toHaveAttribute('role', 'status')
    expect(screen.getByRole('list', { name: 'Genererade värden' })).not.toHaveAttribute('aria-live')
  })
})
