//Vitest test from jest conversion

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from '../../components/RecipeCard'; // Path

// Mocking FavoriteButton to avoid external dependencies
vi.mock('../../components/FavoriteButton', () => ({
  default: () => <div>Mock FavoriteButton</div>
}));

// Mock recipe object to pass to the component
const mockRecipe = {
  id: 1,
  title: 'Pumpkin Pie',
  image: 'https://example.com/pumpkin.jpg',
  readyInMinutes: 45,
  servings: 4,
  pricePerServing: 150, 
};

describe('RecipeCard Component', () => {
  it('creates the recipe title and image', () => {
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    expect(screen.getByText('Pumpkin Pie')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockRecipe.image);
  });

  it('shows servings and price correctly', () => {
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    expect(screen.getByText('4')).toBeInTheDocument(); // Servings
    expect(screen.getByText('$6.00')).toBeInTheDocument(); // Price (150 * 4 / 100)
  });
});
