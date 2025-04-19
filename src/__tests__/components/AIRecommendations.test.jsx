import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIRecommendations from '../../components/AIRecommendations';

vi.mock('../../components/RecipeCard', () => ({
  default: () => <div>Mock RecipeCard</div>
}));
vi.mock('../../components/LoadingIndicator', () => ({
  default: () => <div>Loading...</div>
}));
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: { Dietary: 'Vegan' }, error: null })
        }),
        order: () => ({
          ilike: () => ({
            limit: () => ({
              then: (res) => res({ data: [], error: null })
            })
          })
        })
      })
    })
  }
}));

describe('AIRecommendations', () => {
  it('renders loading indicators initially', () => {
    render(<AIRecommendations userId="test-user" />);
    const loaders = screen.getAllByText(/loading/i);
    expect(loaders).toHaveLength(3); // 3 loading placeholders
  });
});
