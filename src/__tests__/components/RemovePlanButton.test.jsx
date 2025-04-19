
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import RemovePlanButton from '../../components/RemovePlanButton';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        match: () => ({
          single: () => ({ data: { recipe_id: 1, meal_type: "lunch", scheduled_date: "today" }, error: null })
        })
      }),
      delete: () => ({ match: () => ({}) }),
      insert: () => ({})
    })
  }
}));

describe('RemovePlanButton', () => {
  it('create remove button', () => {
    render(<RemovePlanButton userId="1" spoonacularId="2" />);
  });
});
