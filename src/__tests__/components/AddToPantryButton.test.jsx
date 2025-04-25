import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddToPantryButton from '../../components/AddToPantryButton';
import { supabase } from '../../supabaseClient';

// Vitest mock of the supabase client
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: function () { return this; },
      eq: function () { return this; },
      ilike: function() { return this; },
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('AddToPantryButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows login error when no userId', () => {
    render(
      <AddToPantryButton
        ingredient={{ name: 'Sugar', amount: '1', unit: 'cup', estimatedPrice: 2 }}
        userId={null}
      />
    );
    const btn = screen.getByRole('button', { name: /add to pantry/i });
    fireEvent.click(btn);
    expect(screen.getByText(/please log in to add items to your pantry/i)).toBeInTheDocument();
  });

  test('adds to pantry on click when user is logged in', async () => {
    render(
      <AddToPantryButton
        ingredient={{ name: 'Sugar', amount: '1', unit: 'cup', estimatedPrice: 2 }}
        userId='user123'
      />
    );
    const btn = screen.getByRole('button', { name: /^Add to Pantry$/i });
    fireEvent.click(btn);
    expect(supabase.from).toHaveBeenCalledWith('pantry');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Added!/i })).toBeInTheDocument();
    });
  });
});
