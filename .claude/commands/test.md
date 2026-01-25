# /test - Run Test Suite

Run the test suite with optional filters.

## Usage

```
/test                    # Run all tests
/test <pattern>          # Run tests matching pattern
/test --watch            # Run in watch mode
/test --coverage         # Run with coverage report
```

## Steps

1. **Parse Arguments**
   Extract pattern and flags from command.

2. **Run Tests**
   ```bash
   # All tests
   npm run test

   # Filtered
   npm run test -- -t "<pattern>"

   # Specific files
   npm run test:file -- "<glob>"

   # Watch mode
   npm run test -- --watch

   # Coverage
   npm run test -- --coverage
   ```

3. **Report Results**
   ```
   ═══════════════════════════════════════
     Test Results
   ═══════════════════════════════════════

   Suites:  [passed]/[total]
   Tests:   [passed]/[total]
   Time:    [duration]

   [If failures, show details]
   ═══════════════════════════════════════
   ```

## Test Organization

| Directory | Contents |
|-----------|----------|
| `src/**/*.test.ts` | Unit tests |
| `src/**/*.spec.ts` | Integration tests |
| `e2e/` | End-to-end tests |

## Notes
- Tests run with Vitest
- Coverage threshold: 80%
- Run tests before every PR
