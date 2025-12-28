export class BrowserRepository {
  constructor(browser) {
    this._browser = browser;
  }

  delete(key) {
    return this._browser.storage.local.remove(key);
  }

  getAll() {
    return this._browser.storage.local.get(null);
  }

  getByKey(key) {
    return this._browser.storage.local.get(key);
  }

  save(key, value) {
    return this._browser.storage.local.set({ [key]: value });
  }
}
