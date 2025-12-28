export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  getItem(key) {
    return this._browser.storage.local.get(key);
  }

  getItems() {
    return this._browser.storage.local.get(null);
  }
}
