# Testing Instructions for Coding Agents

This document provides guidelines for coding agents when creating or modifying tests in this repository.

## Test Structure

### Unit Tests (Jest + React Testing Library)

**Location**: Place unit tests in a `__tests__` directory adjacent to the components being tested.

```
src/app/_components/
├── ComponentName.tsx
└── __tests__/
    └── ComponentName.test.tsx
```

**Example**: For a component at `src/app/_components/ChatInputForm.tsx`, create tests at:
```
src/app/_components/__tests__/ChatInputForm.test.tsx
```

**Running Unit Tests**:
- Run all unit tests: `npm test`
- Watch mode: `npm run test:watch`

**Test Framework Configuration**:
- Testing framework: Jest 30.2.0
- Component testing: React Testing Library 16.3.2
- DOM testing utilities: @testing-library/jest-dom 6.9.1
- User interaction simulation: @testing-library/user-event 14.6.1

**Writing Unit Tests**:
- Import from `@testing-library/react` for rendering components
- Use `fireEvent` for simple DOM events (form submission, key presses)
- Use `userEvent` from `@testing-library/user-event` for realistic user interactions (typing, clicking)
- Always clean up with appropriate cleanup functions
- Use `screen` queries for finding elements
- Prefer accessible queries (getByRole, getByLabelText, getByPlaceholderText)

**Test Coverage Guidelines**:
- Test component rendering with different props
- Test user interactions (clicks, typing, form submissions)
- Test conditional rendering based on state/props
- Test edge cases (empty inputs, loading states, disabled states)
- Test keyboard shortcuts and accessibility features
- Aim for comprehensive coverage of component behavior

**Example Test Structure**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    // Define default props
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = jest.fn();
    render(<ComponentName {...defaultProps} onAction={mockHandler} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)

**Location**: Place e2e tests in the `e2e/` directory at the project root.

```
e2e/
├── chat.spec.ts
└── other-feature.spec.ts
```

**Running E2E Tests**:
- Run all e2e tests: `npm run test:e2e`
- Run with UI: `npm run test:e2e:ui`

**Writing E2E Tests**:
- Test complete user flows from start to finish
- Test interactions between multiple components
- Test API integration and data flow
- Verify visual elements and user feedback
- Test responsive behavior if applicable

**Example E2E Test Structure**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/');
    
    // Interact with elements
    await page.fill('input[placeholder="..."]', 'test input');
    await page.click('button[type="submit"]');
    
    // Verify results
    await expect(page.getByText('expected text')).toBeVisible();
  });
});
```

## Running All Tests

To run both unit and e2e tests together:
```bash
npm run test:all
```

## CI/CD Integration

Tests are automatically run via GitHub Actions on:
- Every push to any branch
- Every pull request

The test workflow includes:
1. Unit tests (Jest)
2. E2E tests (Playwright)
3. Build verification

## Important Notes for Coding Agents

### JSDOM Limitations
- JSDOM (used by Jest) does not implement all browser APIs
- Known limitation: `HTMLFormElement.prototype.requestSubmit` is not implemented
- **Solution**: Use `fireEvent.submit(form)` instead of clicking submit buttons for form submission tests
- This avoids console errors while still properly testing form behavior

### Test Organization
- Keep tests focused and isolated
- One describe block per component
- Group related tests with clear descriptions
- Use beforeEach/afterEach for setup and cleanup
- Mock external dependencies and API calls

### Best Practices
- Write tests before or alongside code changes
- Ensure all tests pass before committing
- Add tests for bug fixes to prevent regressions
- Update tests when changing component behavior
- Test both happy paths and error cases
- Consider accessibility in tests (use accessible queries)

### Performance
- Unit tests should be fast (< 1 second per test)
- E2E tests can be slower but should still be reasonable
- Use appropriate timeouts for async operations
- Clean up resources properly to avoid memory leaks

## Test Commands Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run all e2e tests |
| `npm run test:e2e:ui` | Run e2e tests with interactive UI |
| `npm run test:all` | Run both unit and e2e tests |
| `npm run build` | Build the application |
| `npm run lint` | Run linter |

## Example: Testing a New Component

When creating a new component `NewComponent.tsx` in `src/app/_components/`:

1. Create the component file: `src/app/_components/NewComponent.tsx`
2. Create the test file: `src/app/_components/__tests__/NewComponent.test.tsx`
3. Write comprehensive tests covering all functionality
4. Run `npm test` to verify unit tests pass
5. If the component affects user flows, add e2e tests in `e2e/`
6. Run `npm run test:all` to verify all tests pass
7. Commit both the component and its tests together
