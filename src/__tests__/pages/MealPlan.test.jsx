import { render, screen } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import MealPlanPage from '../../pages/MealPlan'

// Mock Supabase client for data fetching
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [], error: null })
        })
      })
    })
  }
}))

describe('MealPlanPage', () => {
  it('renders meal plan header', async () => {
    render(<MealPlanPage userData={{ id: 'test' }} />)

    // Use findByText to wait for the header text to appear
    const heading = await screen.findByText(/your meal plan/i)

    expect(heading).toBeInTheDocument()
  })
})
