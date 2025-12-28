export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  getItem(key) {
    return this._browser.storage.local.get(key);
  }

  getAll() {
    return this._browser.storage.local.get(null);
  }
}
