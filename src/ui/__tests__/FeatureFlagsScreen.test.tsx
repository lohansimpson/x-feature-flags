import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { FeatureFlagsScreen } from '../FeatureFlagsScreen';

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
} as any;

describe('FeatureFlagsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows warning screen initially', () => {
    (chrome.storage.local.get as jest.Mock).mockImplementation(() => Promise.resolve({}));
    render(<FeatureFlagsScreen />);
    
    expect(screen.getByText('☢️ Use this extension at your own risk ☢️')).toBeInTheDocument();
  });

  it('shows feature flags after warning confirmation', async () => {
    (chrome.storage.local.get as jest.Mock).mockImplementation((key) => 
      Promise.resolve({ isWarningConfirmed: true })
    );
    
    render(<FeatureFlagsScreen />);
    
    expect(await screen.findByPlaceholderText('Search Features')).toBeInTheDocument();
  });
}); 