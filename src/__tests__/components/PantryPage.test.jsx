
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import PantryPage from '../../components/PantryPage';

vi.mock('../../services/pantryService', () => ({
  default: {
    getUserPantry: () => [],
    removeFromPantry: () => {},
    updatePantryItemQuantity: () => {}
  }
}));

describe('PantryPage', () => {
  it('renders pantry page for user', () => {
    render(<PantryPage userData={{ id: 'user123' }} />);
  });
});
