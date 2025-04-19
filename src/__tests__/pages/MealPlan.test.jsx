
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import MealPlanPage from '../../pages/MealPlan';



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
}));

describe('MealPlanPage', () => {
  it('renders meal plan header', () => {
    render(<MealPlanPage userData={{ id: 'test' }} />);
    expect(screen.getByText(/your meal plan/i)).toBeInTheDocument();
  });
});
