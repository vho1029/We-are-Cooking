//Vitest test from jest conversion

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from '../../components/RecipeCard'; // ✅ Correct relative path

// ✅ Mocking FavoriteButton to avoid external dependencies
vi.mock('../../components/FavoriteButton', () => ({
  default: () => <div>Mock FavoriteButton</div>
}));

// ✅ Mock recipe object to pass to the component
const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  image: 'https://example.com/test.jpg',
  readyInMinutes: 45,
  servings: 2,
  pricePerServing: 150, // cents
};

describe('RecipeCard Component', () => {
  it('renders the recipe title and image', () => {
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockRecipe.image);
  });

  it('displays servings and price correctly', () => {
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Servings
    expect(screen.getByText('$3.00')).toBeInTheDocument(); // Price (150 * 2 / 100)
  });
});
