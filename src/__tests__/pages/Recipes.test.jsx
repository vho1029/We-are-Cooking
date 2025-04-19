
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import RecipesPage from '../../pages/Recipes';



vi.mock('../../components/RecipeSearch', () => ({
  default: () => <div>MockSearch</div>
}));
vi.mock('../../components/Recommendations', () => ({
  default: () => <div>MockRecommendations</div>
}));

describe('RecipesPage', () => {
  it('renders recommended recipes section', () => {
    render(<RecipesPage userData={{ id: 'test' }} />);
    expect(screen.getByText(/recommended recipes/i)).toBeInTheDocument();
  });
});
