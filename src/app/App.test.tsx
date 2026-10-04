import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App generator UI', () => {
  it('exposes implemented identifier generators', () => {
    render(<App />)
    const generator = screen.getByLabelText('Generator')
    expect(generator).toHaveTextContent('UUID v4')
    expect(generator).toHaveTextContent('UUID v7')
    expect(generator).toHaveTextContent('ULID')
    expect(generator).toHaveTextContent('NanoID')
    expect(generator).toHaveTextContent('Alfanumeriskt ID')
    expect(generator).toHaveTextContent('Numeriskt ID')
  })

  it('can generate UUID v7 and ULID from the selector', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Generator'), { target: { value: 'uuid-v7' } })
    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))
    expect((await screen.findByLabelText('Genererat värde 1')).textContent).toMatch(/^[0-9a-f-]{36}$/i)

    fireEvent.change(screen.getByLabelText('Generator'), { target: { value: 'ulid' } })
    expect(await screen.findByRole('heading', { name: 'ULID' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))
    await waitFor(() => expect(screen.getByLabelText('Genererat värde 1').textContent).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/))
  })

  it('enables Secrets and Hash categories but keeps Keys disabled', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Secrets/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Hash/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Nycklar/i })).toBeDisabled()
  })

  it('shows secret generators', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Secrets/i }))
    const generator = screen.getByLabelText('Generator')
    expect(generator).toHaveTextContent('Hex')
    expect(generator).toHaveTextContent('Base64')
    expect(generator).toHaveTextContent('Base64URL')
    expect(generator).toHaveTextContent('API token')
    expect(generator).toHaveTextContent('Token')
    expect(generator).toHaveTextContent('PK token')
  })

  it('hashes text locally', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Hash/i }))
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))
    expect(await screen.findByText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')).toBeInTheDocument()
  })

  it('generates batches and copies them', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<App />)
    fireEvent.change(screen.getByLabelText('Antal'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /^generera$/i }))
    expect(await screen.findByRole('heading', { name: 'Genererade värden (5)' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /kopiera alla/i }))
    await screen.findByText('Kopierade 5 värden')
    expect((writeText.mock.calls.at(-1)?.[0] as string).split('\n')).toHaveLength(5)
  })

  it('provides mobile category selection for implemented categories', () => {
    render(<App />)
    const category = screen.getByLabelText('Kategori')
    fireEvent.change(category, { target: { value: 'secrets' } })
    expect(screen.getByRole('heading', { name: 'Hex' })).toBeInTheDocument()
  })
})
