import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the app shell with the workout logging flow', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Forta' })).toBeInTheDocument()
    expect(await screen.findByText('No hay ejercicios todavía.')).toBeInTheDocument()
  })
})
