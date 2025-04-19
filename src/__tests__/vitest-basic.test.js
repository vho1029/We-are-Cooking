import { describe, it, expect } from 'vitest';

// Basic tests
describe('Basic test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should handle strings', () => {
    expect('hello world').toContain('world');
  });
});

// More complex tests
describe('Additional tests', () => {
  it('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
  
  it('should handle objects', () => {
    const obj = { name: 'Recipe', servings: 4 };
    expect(obj).toHaveProperty('name');
    expect(obj.servings).toBe(4);
  });
});