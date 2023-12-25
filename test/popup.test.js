import "puppeteer";

const timeout = 5000;
describe("Google", () => {
  beforeAll(async () => {
  // TODO delete
  //  const browser = await puppeteer.launch({headless: false});
  //  const page = await browser.newPage();
    await page.goto("https://google.com");
  }, timeout);

  // TODO the browser is closed?
  //afterEach(async () => {
  //  console.log('init close browser');
  //  await browser.close();
  //}, timeout);

  it('should display "google" text on page', async () => {
    console.log('init');
    let page_title = await page.title();
    console.log(`Page title: '${page_title}'`);
    await expect(page.title()).resolves.toMatch('Google');
    // TODO const ModulePopup = require('../popup/popup.js');
    console.log('end');
  }, timeout);

});

