
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import Login from '../../components/Login';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: () => ({ data: { user: { id: '1' } }, error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: {}, error: null })
        })
      })
    })
  }
}));

describe('Login', () => {
  it('creates login form', () => {
    render(<Login />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
