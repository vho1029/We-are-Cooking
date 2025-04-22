import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Recommendations from '../../components/Recommendations'

// Mock Supabase fetch
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => ({
          eq: () => ({
            then: (cb) => cb({ data: [], error: null })
          }),
        }),
      }),
    }),
  },
}))

describe('Recommendations', () => {
  it('shows loading initially', async () => {
    render(<Recommendations userId="123" />)

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })
})
