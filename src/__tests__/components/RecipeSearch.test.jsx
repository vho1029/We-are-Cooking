
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import RecipeSearch from '../../components/RecipeSearch';

vi.mock('../../services/recipeSearchService', () => ({
  searchRecipes: () => []
}));
vi.mock('../../components/FavoriteButton', () => ({
  default: () => <div>Favorite</div>
}));
vi.mock('../../components/MealPlanButton', () => ({
  default: () => <div>MealPlan</div>
}));

describe('RecipeSearch', () => {
  it('renders search input', () => {
    render(<RecipeSearch />);
    expect(screen.getByPlaceholderText(/search recipes/i)).toBeInTheDocument();
  });
});
