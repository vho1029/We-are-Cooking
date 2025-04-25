// src/__tests__/components/FavoriteButton.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoriteButton from '../../components/FavoriteButton';
import { supabase } from '../../supabaseClient';

// Vitest mock of the supabase client
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // prevent real alerts in tests
    window.alert = vi.fn();
  });

  test('renders "Favorited" when initialFavorite is true', () => {
    render(
      <FavoriteButton
        recipeId={123}
        userId={456}
        initialFavorite={true}
      />
    );
    // look for the button whose accessible name is exactly "Favorited"
    const btn = screen.getByRole('button', { name: /^Favorited$/i });
    expect(btn).toHaveTextContent('Favorited');
  });

  test('toggles to "Favorited" and calls Supabase.insert on click', async () => {
    render(
      <FavoriteButton
        recipeId={123}
        userId={456}
        initialFavorite={false}
      />
    );
    // initial text is "Favorite"
    const btn = screen.getByRole('button', { name: /^Favorite$/i });
    expect(btn).toHaveTextContent('Favorite');

    // click to add favorite
    fireEvent.click(btn);
    expect(supabase.from).toHaveBeenCalledWith('user_favorites');

    // after the async toggle, text becomes "Favorited"
    await waitFor(() => {
      expect(btn).toHaveTextContent('Favorited');
      expect(btn).not.toBeDisabled();
    });
  });
});
