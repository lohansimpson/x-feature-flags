import '@testing-library/jest-dom';


// Mock chrome.runtime
global.chrome = {
  runtime: {
    getURL: (path: string) => path,
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    }
  }
} as any; 


// Keep your Node-like patch of the Chrome API if needed:
global.chrome = {
  runtime: {
    getURL: (path: string) => path,
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    }
  }
} as any; 

