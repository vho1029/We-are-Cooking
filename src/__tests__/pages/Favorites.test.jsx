
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import FavoritesPage from '../../pages/Favorites'


vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          in: () => ({ data: [], error: null })
        })
      })
    })
  }
}));

describe('FavoritesPage', () => {
  it('shows a message when no user is logged in', () => {
    render(<FavoritesPage userData={null} />);
    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });
});
