# Plan: Improve checkIframe — Priorities

## Manifest v3 Migration

Migration broken into independent commits, all tests passing at each step.

### Step 1: Rename `browser_action` to `action` in manifest and code

**What changes:**
- `manifest.json`: rename `"browser_action"` key to `"action"`
- `background.js`: rename `browser.browserAction.setTitle()` → `browser.action.setTitle()` and `browser.browserAction.setIcon()` → `browser.action.setIcon()`
- `background.js`: update commented-out listener (line 7) from `browserAction` to `action`
- `test/fake.js`: rename `browserAction` to `action` in the fake browser object

**Files:** `src/manifest.json`, `src/background_scripts/background.js`, `test/fake.js`

### Step 2: Convert background script to ES module

**What changes:**
- `manifest.json`: change `"background": { "scripts": [...] }` to `"background": { "scripts": [...], "type": "module" }`
- No code changes needed — background.js only uses plain functions and `const`/`let` (no module imports/exports yet)

**Files:** `src/manifest.json`

### Step 3: Migrate `tabState` from in-memory Map to `browser.storage.session`

**Why:** In v3, the background is a service worker that can be terminated. The in-memory `tabState` Map would be lost. `browser.storage.session` persists across service worker restarts but clears when the browser closes — same lifecycle as the current behavior.

**What changes:**
- `background.js`: replace `const tabState = new Map()` with async functions that read/write `browser.storage.session`
- Replace `tabState.get()`, `tabState.set()`, `tabState.delete()` with `browser.storage.session.get/set/remove`
- Functions affected: `wasAlreadyProcessed`, `rememberProcessedTab`, `saveTabAppearance`, `refreshTabIcon`, `tabs.onRemoved` listener
- Make functions that read `tabState` async (they already mostly are)
- `test/fake.js`: add `storage.session` mock (same structure as `storage.local`)

**Files:** `src/background_scripts/background.js`, `test/fake.js`, `test/background_scripts/background.test.js`

### Step 4: Bump manifest version to 3

**What changes:**
- `manifest.json`: change `"manifest_version": 2` to `"manifest_version": 3`

**Files:** `src/manifest.json`

### Step 5: Add `host_permissions` for content script URLs (v3 requirement)

**What changes:**
- In v3, content script URL patterns must also appear in `host_permissions` (or use `optional_host_permissions` for dynamic requests)
- `manifest.json`: add `"host_permissions": ["https://*/*", "http://*/*", "file:///*"]`

**Files:** `src/manifest.json`

---

## Test Improvements & Dependency Cleanup (After v3 Migration)

### Step 6: Review and drop `babel-plugin-rewire`

**Why:** `babel-plugin-rewire` is unmaintained (last release 2018), causes the need for global workarounds in `test/setup.js`, and adds complexity. It's the only reason tests access private functions via `__get__`/`__set__`.

**What changes:**
- Refactor tests to only test through public interfaces (exported functions, DOM effects, message calls)
- For functions that need direct testing, export them (or restructure code so behavior is testable through public API)
- Remove `babel-plugin-rewire` from `package.json` and `babel.config.js`
- Drop `test/setup.js` and `setupFiles` from `jest.config.js` (if no longer needed)

**Impact:** Large test refactor, but results in simpler, more maintainable tests.

### Step 7: Evaluate dropping Babel entirely

**Why:** If `babel-plugin-rewire` is removed, the only remaining Babel plugin is `@babel/plugin-transform-modules-commonjs` (converts ES modules to CommonJS for Jest). Jest 30+ supports native ESM via `--experimental-vm-modules` or the `transform` config.

**What to evaluate:**
- Can Jest run the test suite with native ESM (no Babel transform)?
- If yes: remove `@babel/plugin-transform-modules-commonjs`, `.babelrc`, and `babel.config.js`
- If not: keep the CommonJS transform only

**Files:** `package.json`, `.babelrc`, `babel.config.js`, `jest.config.js`

### Step 8: Audit pinned transitive dependencies

**What:** Review if `brace-expansion`, `node-forge`, and `flatted` pinned versions are still needed with updated dependency tree after removing Babel plugins.

**Action:** Run `npm audit`, check if the vulnerable transitive paths still exist. Remove pins that are no longer needed.

**Files:** `package.json`

---

## Previously Planned Items (Keep for Reference)

### Update to Manifest v3

When this is done, undo these changes because v3 supports ES6 imports:
- ~~Drop src/constants.js file and from the manifest.json file~~ (Already done — constants.js was removed in Phase 3)
- Content script could use ES module imports in the future (requires `"type": "module"` in manifest content_scripts — but this has limitations: no `window.hasRun` guard, no IIFE pattern, and not all browsers support it yet)
