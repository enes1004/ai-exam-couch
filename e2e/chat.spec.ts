import { test, expect } from '@playwright/test';

test.describe('AI Exam Couch Chat Interface', () => {
  test('should display welcome screen on initial load', async ({ page }) => {
    await page.goto('/');

    // Check that welcome screen elements are visible
    await expect(page.getByText('Hey there! Ready to study?')).toBeVisible();
    await expect(page.getByText(/I'm your personal exam tutor/)).toBeVisible();
    
    // Check that suggestion chips are visible
    await expect(page.getByText('Explain recursion')).toBeVisible();
    await expect(page.getByText('Quiz me on React')).toBeVisible();
    await expect(page.getByText('What is Big-O?')).toBeVisible();
  });

  test('should display header with app name', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('AI Exam Couch').first()).toBeVisible();
    await expect(page.getByText('Your friendly study buddy')).toBeVisible();
  });

  test('should display footer with attribution', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Powered by Anthropic Claude API')).toBeVisible();
  });

  test('should have input field and send button', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask me anything...');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const sendButton = page.getByRole('button', { name: 'Send message' });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled(); // Should be disabled when input is empty
  });

  test('should enable send button when text is entered', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask me anything...');
    const sendButton = page.getByRole('button', { name: 'Send message' });

    await input.fill('Hello');
    await expect(sendButton).toBeEnabled();

    await input.clear();
    await expect(sendButton).toBeDisabled();
  });

  test('should display "Enter to send" checkbox', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Use Enter to send')).toBeVisible();
    
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });

  test('should toggle "Enter to send" checkbox', async ({ page }) => {
    await page.goto('/');

    const checkbox = page.getByRole('checkbox');
    
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should show/hide hint text based on checkbox state', async ({ page }) => {
    await page.goto('/');

    const checkbox = page.getByRole('checkbox');
    const hintText = page.getByText('(Shift+Enter to send)');
    
    // Initially unchecked, hint should be visible
    await expect(hintText).toBeVisible();
    
    // Check the box, hint should be hidden
    await checkbox.check();
    await expect(hintText).not.toBeVisible();
    
    // Uncheck the box, hint should be visible again
    await checkbox.uncheck();
    await expect(hintText).toBeVisible();
  });

  test('should allow typing in input field', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask me anything...');
    const testMessage = 'What is recursion?';
    
    await input.fill(testMessage);
    await expect(input).toHaveValue(testMessage);
  });

  test('should resize textarea when typing multiple lines', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask me anything...');
    
    // Get initial height
    const initialHeight = await input.evaluate((el) => el.clientHeight);
    
    // Add multiple lines
    await input.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    
    // Wait for resize
    await page.waitForTimeout(100);
    
    const newHeight = await input.evaluate((el) => el.clientHeight);
    
    // Height should increase
    expect(newHeight).toBeGreaterThan(initialHeight);
  });
});
