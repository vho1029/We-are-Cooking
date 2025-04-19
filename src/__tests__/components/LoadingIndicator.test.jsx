
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingIndicator from '../../components/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders with message', () => {
    render(<LoadingIndicator />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
