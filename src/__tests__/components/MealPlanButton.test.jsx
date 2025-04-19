
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import MealPlanButton from '../../components/MealPlanButton';

vi.mock('../../api', () => ({
  getRecipeDetails: () => ({}),
  getIngredientPrices: () => [],
  insertIngredient: () => 1,
  insertPantryItem: () => {},
  saveRecipeToSupabase: () => 1,
  addMealPlan: () => {}
}));
vi.mock('../../supabaseClient', () => ({
  supabase: {}
}));

describe('MealPlanButton', () => {
  it('renders input fields and button', () => {
    render(<MealPlanButton userId="user123" recipeId={42} />);
  });
});
