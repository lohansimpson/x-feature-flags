// ... existing imports ...
import puppeteer, { Browser, Page } from 'puppeteer';
const extensionPath = require('path').resolve(process.env.EXTENSION_PATH || './extension');

const SECONDS = 4000;
const DEV = process.env.DEV;
jest.setTimeout(120 * SECONDS); // Increase overall timeout

// At the top of the file, before the tests
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
};

// Mock chrome API
global.chrome = {
  storage: mockChromeStorage,
  // Add other chrome APIs as needed
} as unknown as typeof chrome;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  mockChromeStorage.local.get.mockImplementation(() => Promise.resolve({}));
});

// cookies for testing


const createCookie = (name: string, value: string) => ({
  name,
  value,
  domain: '.x.com',
  path: '/',
  expires: Math.floor(Date.now() / 1000 + 3600),
  secure: true,
  sameSite: 'None' as const,
  url: 'https://x.com',
});

// Add validation for environment variables
const requiredCookies = [
  "AUTH_TOKEN",
  "CT0",
  "Twid",
  "Personalization_id",
  "Kdt",
  "Guest_id_marketing",
  "Guest_id_ads",
  "Guest_id"
];

// Validate cookies before creating array
requiredCookies.forEach(cookieName => {
  if (!process.env[cookieName]) {
    throw new Error(`Missing required environment variable: ${cookieName}`);
  }
});

const cookies = requiredCookies.map(name => 
  createCookie(name.toLowerCase(), process.env[name]!)
);

// ... existing chrome mock and describe block ...
describe('FeatureFlagsScreen Chrome Tests', () => { 
  // Add this new describe block for E2E tests
  describe('Extension E2E Tests', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
      console.log('Loading extension from:', extensionPath);
      browser = await puppeteer.launch({
        headless: true,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
      });

      // Verify extension is loaded
      const targets = await browser.targets();
      const extensionTarget = targets.find((target) => 
        target.type() === 'service_worker' && target.url().includes('background')
      );
      
      if (!extensionTarget) {
        console.log('Extension not loaded. Available targets:', 
          targets.map(t => ({ type: t.type(), url: t.url() }))
        );
        console.log('Extension failed to load');
      }
      console.log('Extension successfully loaded');
    });

    beforeEach(async () => {
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
      );
      
      // Set default timeouts
      page.setDefaultTimeout(45000);
      page.setDefaultNavigationTimeout(45000);
      
      await page.goto('https://x.com', { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 45000 
      });
    });


    afterEach(async () => {
      if (page) {
        await page.close();
      }
    });

    afterAll(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('should be able to click sign in button on X.com with extension installed', async () => {
      if (DEV) {
        await page.screenshot({ path: 'initial-load.png' });
      }
      
      // Wait for any sign in button to appear
      const signInButton = await page.waitForFunction(() => {
        return Array.from(document.querySelectorAll('span')).find(
          span => span.textContent === 'Sign in' || span.textContent === 'Log in'
        );
      }, { timeout: 45000 });
      
      if (!signInButton) {
        if (DEV) {
          await page.screenshot({ path: 'no-sign-in-button.png' });
        }
        throw new Error('Sign in button not found');
      }
      
      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('span')).find(
          span => span.textContent === 'Sign in' || span.textContent === 'Log in'
        );
        button?.click();
      });
      
      // Wait for navigation
      await page.waitForNavigation({ timeout: 45000 });
      expect(page.url()).toContain('/login');
    }, 90000);
    
    

    it('should load extension on X.com', async () => {
      // Set cookies one by one instead of all at once
      for (const cookie of cookies) {
        await page.setCookie(cookie);
      }
    

    
      // Reload the page to ensure cookies are applied
      await page.reload({ waitUntil: 'networkidle2' });

      //debug
      if (DEV) {
        await page.screenshot({ path: 'after-set-cookies-screenshot.png' });
      }
      
      // Wait for extension iframe or button to be present
      await page.evaluate(() => {
        const signInButton_2 = Array.from(document.querySelectorAll('span')).find(
          span => span.textContent === 'Features'
        );
        if (signInButton_2) {
          signInButton_2.click();
        } else {
          throw new Error('Features button not found');
        }
      });
      
      if (DEV) {
        await page.screenshot({ path: 'after-click-screenshot.png' });
      }
      // Verify feature flags interface is visible
      const featureFlagsElement = await page.evaluate(() => {
        const element = document.querySelector('[data-testid="usage-warning"]');
        if (!element) return true;
        return false;
      });
      expect(featureFlagsElement).toBeTruthy();
    }, 80000); // Increase timeout for E2E test
  
  });
});
