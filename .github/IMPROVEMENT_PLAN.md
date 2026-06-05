# Plan: Improve checkIframe — Priorities

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
