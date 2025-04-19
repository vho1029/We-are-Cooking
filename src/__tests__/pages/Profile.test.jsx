import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Profile from '../../pages/Profile';

vi.mock('react-router-dom', () => ({
  useNavigate: () => () => {}
}));

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => ({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      }),
      signOut: () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: {
              name: 'Jet Blaze',
              username: 'Tom Cruise',
              email: 'JB@example.com',
              DOB: '1990-01-01',
              Dietary: 'Vegan'
            },
            error: null
          })
        })
      })
    })
  }
}));

describe('Profile', () => {
  it('profile heading only', async () => {
    render(<Profile />);
    const heading = await screen.findByRole('heading', { name: /profile/i });
    expect(heading).toBeInTheDocument();
  });
});
