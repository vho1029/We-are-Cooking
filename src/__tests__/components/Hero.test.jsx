import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '../../components/Hero';

// Mock react-router-dom useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

describe('Hero Component', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  test('renders heading, description, and Get Started button', () => {
    render(<Hero />);

    // Heading
    expect(
      screen.getByRole('heading', {
        name: /Welcome to Meal Prep & Recipe App/i,
      })
    ).toBeInTheDocument();

    // Description text
    expect(
      screen.getByText(
        /Discover and manage your meals with ease\. Explore thousands of recipes, create meal plans, and stay healthy!/i
      )
    ).toBeInTheDocument();

    // Get Started button
    const btn = screen.getByRole('button', { name: /Get Started/i });
    expect(btn).toBeInTheDocument();
  });

  test('calls navigate to "/auth" when button is clicked', () => {
    render(<Hero />);
    const btn = screen.getByRole('button', { name: /Get Started/i });
    fireEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith('/auth');
  });
});
