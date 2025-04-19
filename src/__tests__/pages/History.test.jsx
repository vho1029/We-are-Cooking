import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import HistoryPage from '../../pages/History';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          then: (res) =>
            res({
              data: [
                {
                  recipe_id: 1,
                  meal_type: 'Dinner',
                  scheduled_date: new Date().toISOString(),
                  spoonacular_id: 1,
                },
              ],
              error: null,
            }),
        }),
      }),
      in: () => ({
        select: () => ({
          then: (res) =>
            res({
              data: [
                {
                  recipe_id: 1,
                  spoonacular_id: 1,
                  title: 'Cheese Pizza',
                  image: 'https://example.com/image.jpg',
                },
              ],
              error: null,
            }),
        }),
      }),
    }),
  },
}));

describe('HistoryPage', () => {
  it('renders meal history header', async () => {
    render(<HistoryPage userData={{ id: 'test-user' }} />);
    const heading = await screen.findByText(/meal history/i);
    expect(heading).toBeInTheDocument();
  });
});
