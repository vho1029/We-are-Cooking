
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import Signup from '../../components/Signup';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: () => ({ data: { user: { id: 'abc' } }, error: null })
    },
    from: () => ({
      insert: () => ({})
    })
  }
}));

describe('Signup', () => {
  it('create signup form', () => {
    render(<Signup />);
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });
});
