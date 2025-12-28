export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  getStoredItem(key) {
    return this._browser.storage.local.get(key);
  }

  getStoredItems() {
    return this._browser.storage.local.get(null);
  }
}
