// Simple script to test if browsers can launch in Docker
const { chromium } = require('@playwright/test');

async function testBrowserLaunch() {
  console.log('Testing browser launch...');
  console.log('Environment:', {
    DOCKER: process.env.DOCKER,
    DISPLAY: process.env.DISPLAY,
    CF_INSTANCE_INDEX: process.env.CF_INSTANCE_INDEX,
  });

  try {
    console.log('\n1. Testing with default settings...');
    const browser1 = await chromium.launch();
    console.log('✅ Default launch successful');
    await browser1.close();
  } catch (error) {
    console.log('❌ Default launch failed:', error.message);
  }

  try {
    console.log('\n2. Testing with headless mode...');
    const browser2 = await chromium.launch({ headless: true });
    console.log('✅ Headless launch successful');
    await browser2.close();
  } catch (error) {
    console.log('❌ Headless launch failed:', error.message);
  }

  try {
    console.log('\n3. Testing with Docker-specific args...');
    const browser3 = await chromium.launch({
      headless: true,
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
    });
    console.log('✅ Docker-specific launch successful');
    await browser3.close();
  } catch (error) {
    console.log('❌ Docker-specific launch failed:', error.message);
  }

  try {
    console.log('\n4. Testing with all flags...');
    const browser4 = await chromium.launch({
      headless: true,
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    });
    console.log('✅ All flags launch successful');
    const page = await browser4.newPage();
    await page.goto('https://example.com');
    console.log('✅ Page navigation successful');
    await browser4.close();
  } catch (error) {
    console.log('❌ All flags launch failed:', error.message);
    console.log('Full error:', error);
  }

  console.log('\n✅ Browser launch test complete!');
}

testBrowserLaunch().catch(console.error);

