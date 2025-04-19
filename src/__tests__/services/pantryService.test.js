
import { describe, it, expect, vi } from 'vitest';
import pantryService from '../../services/pantryService';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [], error: null }),
          maybeSingle: () => ({ data: null }),
          single: () => ({ data: { user_id: 'test' }, error: null })
        })
      }),
      update: () => ({ eq: () => ({ error: null }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { pantry_id: 'abc' }, error: null }) }) }),
      delete: () => ({ eq: () => ({ error: null }) })
    })
  }
}));

vi.mock('../../services/spoonacularService', () => ({
  fetchRecipesFromSpoonacular: () => [{ id: 1, title: 'Test Recipe' }]
}));

describe('pantryService', () => {
  it('getUserPantry should return an array', async () => {
    const result = await pantryService.getUserPantry('user123');
    expect(Array.isArray(result)).toBe(true);
  });

  it('getThreeRecipes should return at least one recipe', async () => {
    const result = await pantryService.getThreeRecipes(['Pasta']);
    expect(result.length).toBeGreaterThan(0);
  });
});
