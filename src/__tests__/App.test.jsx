import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

//Mock Supabase session
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}));

//Mocks for lazy loaded routes
vi.mock('../pages/Auth', () => ({
  default: () => <div><h2>Welcome Back</h2><p>Sign in to access your meal plans</p></div>,
}));

vi.mock('../components/Hero', () => ({
  default: () => (
    <div>
      <h1>Welcome to <span>Meal Prep & Recipe App</span></h1>
    </div>
  ),
}));

describe('App routing for logged-out users', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders Hero page on root route when logged out', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    //Match actual rendered text
    expect(await screen.findByText(/meal prep & recipe app/i)).toBeInTheDocument();
  });

  it('renders Auth page when navigating to /auth while logged out', async () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );

    //Match actual text from Auth.jsx
    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
    expect(await screen.findByText(/sign in to access your meal plans/i)).toBeInTheDocument();
  });
});
