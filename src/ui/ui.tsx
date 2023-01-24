import React from 'react';
import { createRoot } from 'react-dom/client';
import { FeatureFlagsScreen } from './FeatureFlagsScreen';

const root = createRoot(
    document.getElementById('root')!
);

root.render(<FeatureFlagsScreen />);