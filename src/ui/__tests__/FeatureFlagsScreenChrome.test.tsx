// ... existing imports ...
import puppeteer, { Browser, Page } from 'puppeteer';



// cookies for testing


const createCookie = (name: string, value: string) => ({
  name,
  value,
  domain: 'x.com',
  path: '/',
  httpOnly: false,
  secure: true, // Change to true since it's for x.com
  sameSite: 'Lax' as const 
});

// Modify the cookie setting code


const cookies = [
  createCookie('twid', 'u=1855031493321482240'),
  createCookie('personalization_id', '"v1_TGsvaCjOYu2HozOWGChJPA=="'),
  createCookie('kdt', 'phMAxZmWNam0IEtfbHtddkSlbe4Bpfzz3ceiu7zR'),
  createCookie('guest_id_marketing', 'v1:173311194340130068'),
  createCookie('guest_id_ads', 'v1:173311194340130068'),
  createCookie('guest_id', 'v1:173311194340130068'),
  createCookie('ct0', '3a8060b09e37f516af4a830356014f7fa613de351fafcce0fe732fa15f9a469c75701b93cc96c6ce0018cb3b817db7a678019095a148e657c1871afa36e9c2369f11b10196f1d5fbf76ed377c39088f9'),
  createCookie('auth_token', '5b607defad5bbd37c47d477ac8398d259b5d5ff8'),
  createCookie('auth_multi', ' "1781873205021708288:471bb51adbea4788cc31e07e10cc423ea616846d|1686232476954603520:4702d9ef1297aef05b8c28ba6fae60ececf49f9e" '),
];




// ... existing chrome mock and describe block ...
describe('FeatureFlagsScreen Chrome Tests', () => { 
  // Add this new describe block for E2E tests
  describe('Extension E2E Tests', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
      // Launch browser with the extension loaded
      browser = await puppeteer.launch({
        headless: true, // Set to true in CI
        args: [
          `--disable-extensions-except=${process.env.EXTENSION_PATH}`,
           '--load-extension=./extension.zip'
        ],
      });
    });

    beforeEach(async () => {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    );
      await page.goto('https://x.com');
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
      await page.waitForNetworkIdle();
      // Wait for the page to load and sign in button to be visible

      await page.screenshot({ path: 'debug-screenshot.png' });
      
      await page.screenshot({ path: 'before-click-screenshot.png' });
      await page.evaluate(() => {
        const signInButton = Array.from(document.querySelectorAll('span')).find(
          span => span.textContent === 'Sign in' || span.textContent === 'Log in'
        );
        if (signInButton) {
          signInButton.click();
        } else {
          throw new Error('Sign in button not found');
        }
      });
      
      // Verify we're on the login page by checking URL
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    }, 80000); // Increase timeout for E2E test
    
    

    it('should load extension on X.com', async () => {




      // Set cookies
      await page.setCookie(...cookies);
      await page.screenshot({ path: 'after-set-cookies-screenshot.png' });

    
      // Reload the page to ensure cookies are applied
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Wait for extension iframe or button to be present
      await page.waitForSelector('[data-testid="feature-flags-button"]');
      
      // Click extension button to open popup
      await page.click('[data-testid="feature-flags-button"]');
      
      // Verify feature flags interface is visible
      const featureFlagsElement = await page.waitForSelector('[data-testid="feature-flags-screen"]');
      expect(featureFlagsElement).toBeTruthy();
    }, 30000); // Increase timeout for E2E test
  
  });
});
