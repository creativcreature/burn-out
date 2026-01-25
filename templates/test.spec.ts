/**
 * Test Template
 *
 * Usage:
 * 1. Copy this file alongside the file being tested
 * 2. Name it [filename].test.ts or [filename].spec.ts
 * 3. Replace TEST_TARGET with what you're testing
 * 4. Add test cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('TEST_TARGET', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset mocks, setup test data, etc.
  })

  // Cleanup after each test
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('feature or method name', () => {
    it('should do something expected', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = input.toUpperCase()

      // Assert
      expect(result).toBe('TEST')
    })

    it('should handle edge case', () => {
      // Test edge cases
      expect(true).toBe(true)
    })

    it('should throw on invalid input', () => {
      // Test error handling
      expect(() => {
        throw new Error('Invalid input')
      }).toThrow('Invalid input')
    })
  })

  describe('another feature', () => {
    it('should work correctly', async () => {
      // Async test example
      const result = await Promise.resolve('async result')
      expect(result).toBe('async result')
    })
  })
})

/**
 * Component Test Template (React):
 *
 * import { render, screen, fireEvent } from '@testing-library/react'
 * import { ComponentName } from './ComponentName'
 *
 * describe('ComponentName', () => {
 *   it('renders correctly', () => {
 *     render(<ComponentName />)
 *     expect(screen.getByText('expected text')).toBeInTheDocument()
 *   })
 *
 *   it('handles click', () => {
 *     const onClick = vi.fn()
 *     render(<ComponentName onClick={onClick} />)
 *     fireEvent.click(screen.getByRole('button'))
 *     expect(onClick).toHaveBeenCalled()
 *   })
 * })
 */
