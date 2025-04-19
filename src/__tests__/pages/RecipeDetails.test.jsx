
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import RecipeDetails from '../../pages/RecipeDetails'


vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' })
}));
vi.mock('../../api', () => ({
  getRecipeDetails: () => ({}),
  getIngredientPrices: () => [],
  saveRecipeToSupabase: () => {},
  getRecipeFromSupabase: () => null,
  insertIngredient: () => {}
}));

describe('RecipeDetails', () => {
  it('shows loading', () => {
    render(<RecipeDetails />);
    expect(screen.getByText(/loading recipe details/i)).toBeInTheDocument();
  });
});
