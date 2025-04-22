import { render, screen } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import Pantry from '../../pages/Pantry'

// Mock pantry service and API calls
vi.mock('../../services/pantryService', () => ({
  default: {
    getUserPantry: () => Promise.resolve([]),
    getThreeRecipes: () => Promise.resolve([]),
    removeFromPantry: () => Promise.resolve({ success: true }),
    updatePantryItemQuantity: () => Promise.resolve({ success: true })
  }
}))

vi.mock('../../api', () => ({
  getRecipesFromPantry: () => Promise.resolve([])
}))

describe('Pantry', () => {
  it('renders pantry header', async () => {
    render(<Pantry userData={{ id: 'test-user' }} />)

    // Use findByText to ensure we wait for the element to appear
    const heading = await screen.findByText(/my pantry/i)

    // Assert the header is in the document after the async updates
    expect(heading).toBeInTheDocument()
  })
})
