import React from 'react';
import { render, screen } from '@testing-library/react';
import IngredientList from '../../components/IngredientList';

// Mock the IngredientCard component to simplify output
vi.mock('../../components/IngredientCard', () => ({
  default: ({ ingredient }) => (
    <div data-testid="ingredient-card">
      {ingredient.name}
      {ingredient.estimatedPrice !== undefined ? ` - $${ingredient.estimatedPrice}` : ''}
    </div>
  ),
}));

describe('IngredientList Component', () => {
  test('renders no ingredients message when ingredients list is empty', () => {
    render(<IngredientList ingredients={[]} userData={{}} />);
    expect(screen.getByText(/no ingredients available/i)).toBeInTheDocument();
  });

  test('renders IngredientCard for each ingredient with merged priceData', () => {
    const ingredients = [
      { id: 1, name: 'Sugar' },
      { id: 2, name: 'Salt' },
    ];
    const priceData = [
      {
        name: 'Sugar',
        estimatedPrice: 5,
        amountInGrams: 100,
        caloriesPerGram: 4,
        pricePerGram: 0.05,
        krogerId: '123',
        error: null,
      },
    ];

    render(
      <IngredientList
        ingredients={ingredients}
        userData={{ some: 'data' }}
        priceData={priceData}
      />
    );

    // Heading present
    expect(screen.getByRole('heading', { name: /ingredients/i })).toBeInTheDocument();

    // One card per ingredient
    const cards = screen.getAllByTestId('ingredient-card');
    expect(cards).toHaveLength(2);

    // Merged price data reflected in the Sugar card
    expect(screen.getByText('Sugar - $5')).toBeInTheDocument();
    // Salt appears without price info
    expect(screen.getByText('Salt')).toBeInTheDocument();
  });
});
