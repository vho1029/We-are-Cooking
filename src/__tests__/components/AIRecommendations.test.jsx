import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIRecommendations from '../../components/AIRecommendations';

// Mock components and supabase client for testing
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
  it('renders loading indicators initially', async () => {
    render(<AIRecommendations userId="test-user" />);

    // Wait for all loading indicators to appear
    const loaders = await screen.findAllByText(/loading/i);

    // Assert that the correct number of loading placeholders are rendered
    expect(loaders).toHaveLength(3); // 3 loading placeholders
  });
});
