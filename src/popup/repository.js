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

  get(key) {
    return this._browser.storage.local.get(key);
  }

  save(key, value) {
    // TODO? replace [key] -> key
    return this._browser.storage.local.set({ [key]: value });
  }

  async isStored(key) {
    const storedEntry = await this.get(key);
    return Object.keys(storedEntry).length > 0;
  }
}
