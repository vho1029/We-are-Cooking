
import { describe, it, expect, vi } from 'vitest';
import { fetchRecipesFromSpoonacular } from '../../services/spoonacularService';

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ results: [{ id: 1, title: 'Fake Recipe' }] }),
  })
);

describe('fetchRecipesFromSpoonacular', () => {
  it('fetches and returns recipes', async () => {
    const result = await fetchRecipesFromSpoonacular({ query: 'soup' });
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('title');
  });
});
