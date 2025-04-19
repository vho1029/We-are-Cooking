import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

vi.mock('../../components/LogoutButton', () => ({
  default: () => <div>LogoutButton</div>
}));

describe('Navbar', () => {
  it('creates navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/meal plan/i)).toBeInTheDocument();
    expect(screen.getByText(/favorites/i)).toBeInTheDocument();
    expect(screen.getByText(/pantry/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
  });
});
