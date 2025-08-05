import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set mobile viewport (iPhone 12 Pro)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  // Navigate to the dev server
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
  
  // Wait for content to load
  await page.waitForSelector('.sticky', { timeout: 5000 });
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'mobile-initial.png',
    fullPage: false 
  });
  
  // Scroll down to trigger sticky behavior
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(500);
  
  // Take screenshot after scroll
  await page.screenshot({ 
    path: 'mobile-scrolled.png',
    fullPage: false 
  });
  
  // Scroll up to see if pills reappear
  await page.evaluate(() => window.scrollBy(0, -100));
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'mobile-scrolled-up.png',
    fullPage: false 
  });
  
  console.log('Screenshots taken successfully!');
  await browser.close();
})();