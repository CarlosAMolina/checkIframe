export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  getAll() {
    return this._browser.storage.local.get(null);
  }

  getByKey(key) {
    return this._browser.storage.local.get(key);
  }
}
