
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Auth from '../../pages/Auth';



vi.mock('../../components/Login', () => ({
  default: () => <div>LoginComponent</div>
}));
vi.mock('../../components/Signup', () => ({
  default: () => <div>SignupComponent</div>
}));

describe('Auth Component', () => {
  it('renders login view by default and toggles to signup', () => {
    render(<Auth />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });
});
