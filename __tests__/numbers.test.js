import Numbers from '../utils/numbers';

test('Format price correctly without 1000s', () => {
  target = Numbers.formatPrice(3.456, 'US');
  expect(target).toBe("3.46");
});

test('Format price correctly with 1000s', () => {
  target = Numbers.formatPrice(3000.456, 'US');
  expect(target).toBe("3,000.46");
});

// This is bad, the toFixed() is rounding as well
test('Format price correctly', () => {
  target = Numbers.formatBalance(3.456546456, 'US');
  expect(target).toBe("3.45654646");
});
