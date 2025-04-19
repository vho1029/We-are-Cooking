import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Pantry from '../../pages/Pantry';

vi.mock('../../services/pantryService', () => ({
  default: {
    getUserPantry: () => Promise.resolve([]),
    getThreeRecipes: () => Promise.resolve([]),
    removeFromPantry: () => Promise.resolve({ success: true }),
    updatePantryItemQuantity: () => Promise.resolve({ success: true })
  }
}));

vi.mock('../../api', () => ({
  getRecipesFromPantry: () => Promise.resolve([])
}));

describe('Pantry', () => {
  it('pantry header', async () => {
    render(<Pantry userData={{ id: 'test-user' }} />);
    const heading = await screen.findByText(/my pantry/i);
    expect(heading).toBeInTheDocument();
  });
});
