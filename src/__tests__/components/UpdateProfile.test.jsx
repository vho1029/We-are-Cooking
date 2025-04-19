
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import UpdateProfile from '../../components/UpdateProfile';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => ({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
      signInWithPassword: () => ({ error: null }),
      updateUser: () => ({ error: null }),
      signOut: () => ({ error: null })
    },
    from: () => ({
      update: () => ({ eq: () => ({ error: null }) })
    })
  }
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => () => {}
}));

describe('UpdateProfile', () => {
  it('create update form', () => {
    render(<UpdateProfile />);
    expect(screen.getByText(/update profile/i)).toBeInTheDocument();
  });
});
