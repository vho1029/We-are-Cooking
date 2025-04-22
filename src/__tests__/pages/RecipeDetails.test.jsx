import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest'; // 👈 Import vi
import RecipeDetails from '../../pages/RecipeDetails';
import * as api from '../../api';

vi.mock('../../components/AddToPantryButton', () => ({
  default: () => <div data-testid="add-to-pantry-btn" />
}));
vi.mock('../../components/FavoriteButton', () => ({
  default: () => <div data-testid="favorite-btn" />
}));
vi.mock('../../components/MealPlanButton', () => ({
  default: () => <div data-testid="meal-plan-btn" />
}));

const mockRecipe = {
  id: '123',
  title: 'Test Recipe',
  image: 'test.jpg',
  readyInMinutes: 30,
  servings: 4,
  summary: 'Delicious test meal',
  extendedIngredients: [{ name: 'Chicken', amount: 1, unit: 'kg', id: 1 }],
  analyzedInstructions: [{ steps: [{ number: 1, step: 'Cook chicken' }] }],
  nutrition: {
    nutrients: [
      { name: 'Calories', amount: 200, unit: 'kcal' },
      { name: 'Protein', amount: 25, unit: 'g' },
    ]
  },
  total_price: 12.5,
};

vi.spyOn(api, 'getRecipeFromSupabase').mockResolvedValue(null);
vi.spyOn(api, 'getRecipeDetails').mockResolvedValue(mockRecipe);
vi.spyOn(api, 'getIngredientPrices').mockResolvedValue([
  { name: 'Chicken', estimatedPrice: 10, pricePerGram: 0.05, caloriesPerGram: 1 }
]);
vi.spyOn(api, 'saveRecipeToSupabase').mockResolvedValue();
vi.spyOn(api, 'insertIngredient').mockResolvedValue();

describe('RecipeDetails', () => {
  it('renders loading and then recipe content', async () => {
    render(
      <MemoryRouter initialEntries={['/recipe/123']}>
        <Routes>
          <Route path="/recipe/:id" element={<RecipeDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading recipe details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
      expect(screen.getByText(/cook chicken/i)).toBeInTheDocument();
      expect(screen.getByTestId('add-to-pantry-btn')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-btn')).toBeInTheDocument();
      expect(screen.getByTestId('meal-plan-btn')).toBeInTheDocument();
    });
  });
});
