
import { render, fireEvent } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import LogoutButton from '../../components/LogoutButton';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));
vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: vi.fn()
    }
  }
}));

describe('LogoutButton', () => {
  it('renders and triggers logout', () => {
    const { getByText } = render(<LogoutButton />);
    fireEvent.click(getByText(/logout/i));
  });
});
