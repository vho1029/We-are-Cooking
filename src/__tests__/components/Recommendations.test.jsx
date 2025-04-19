
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Recommendations from '../../components/Recommendations';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => ({
          eq: () => ({
            then: (res) => res({ data: [], error: null })
          })
        })
      })
    })
  }
}));

describe('Recommendations', () => {
  it('creates loading initially', () => {
    render(<Recommendations userId="123" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
