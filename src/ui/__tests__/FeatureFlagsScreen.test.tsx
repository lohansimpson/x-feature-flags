/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FeatureFlagsScreen } from '../FeatureFlagsScreen';

// Mock the entire chrome API for node environment
const mockChrome = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((key: string | string[], callback?: (items: Record<string, any>) => void) => {
        if (callback) {
          // For callback-style API
          callback({});
        }
        // For Promise-style API
        return Promise.resolve({});
      }),
      set: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
  },
} as any;

// Mock global chrome
global.chrome = mockChrome;

// Move the mock inside the jest.mock callback
jest.mock('../hooks/useStorageState', () => {
  const useStorageStateMock = jest.fn().mockReturnValue([false, false, jest.fn()]);
  return {
    useStorageState: useStorageStateMock,
  };
});

// Export the mock so we can access it in our tests
const useStorageStateMock = (jest.requireMock('../hooks/useStorageState') as any).useStorageState;

jest.mock('../hooks/useFlags', () => ({
  useFlags: jest.fn().mockReturnValue({
    shownFlags: [],
    shownChanges: [],
    changes: {},
    changeFlag: jest.fn(),
  }),
}));

jest.mock('../hooks/useSubscriptions', () => ({
  useSubscriptions: jest.fn().mockReturnValue({
    shownSubscriptions: [],
    changes: {},
    changeSubscription: jest.fn(),
  }),
}));

describe('FeatureFlagsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default value before each test
    useStorageStateMock.mockReturnValue([false, false, jest.fn()]);
  });

  it('shows warning screen initially', async () => {
    mockChrome.storage.local.get.mockImplementation((key: string | string[], callback?: (items: Record<string, any>) => void) => {
      if (callback) {
        callback({});
      }
      return Promise.resolve({});
    });

    render(<FeatureFlagsScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('☢️ Use this extension at your own risk ☢️')).toBeInTheDocument();
    });
  });

  it('shows feature flags after warning confirmation', async () => {
    mockChrome.storage.local.get.mockImplementation((key: string | string[], callback?: (items: Record<string, any>) => void) => {
      if (callback) {
        callback({ isWarningConfirmed: true });
      }
      return Promise.resolve({ isWarningConfirmed: true });
    });

    // Now this will actually work
    useStorageStateMock.mockReturnValue([true, false, jest.fn()]);

    render(<FeatureFlagsScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
  });
}); 

