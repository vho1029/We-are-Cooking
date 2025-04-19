
import { describe, it, expect, vi } from 'vitest';
import { searchRecipes } from '../../services/recipeSearchService';

vi.mock('../../services/spoonacularService', () => ({
  fetchRecipesFromSpoonacular: () => [
    { id: 1, title: 'Fresh Recipe', servings: 2, pricePerServing: 300, readyInMinutes: 30 }
  ]
}));

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        ilike: () => ({ data: [], error: null }),
      }),
      upsert: () => ({ error: null })
    })
  }
}));

describe('searchRecipes', () => {
  it('returns merged results', async () => {
    const result = await searchRecipes({ query: 'chicken' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('title');
  });
});
