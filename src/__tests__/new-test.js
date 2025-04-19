import { describe, it, expect } from 'vitest';

describe('New test suite', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should also work', () => {
    expect('test').toBeTruthy();
  });
});
