export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  getStoredItems() {
    return this._browser.storage.local.get(null).then((result) => {
      return result;
    });
  }
}
