# Plan: Improve checkIframe — Priorities

## Priority Order

3. **Architecture** — How files are connected and interact (deferred to a later discussion)
4. **Tests** — Coverage gaps and test improvements (deferred to a later discussion)

---

## Phase 3: Architecture Improvements

### 3.1 Extract `readAllUrlArrays` + `notifyContentScriptOfUrlChange`

**Problem:** `browser.storage.local.get({ blacklist: [], notify: [], referer: [] })` is duplicated in `stored-url-entries.js`, `buttons.js`, and `popup.js`. After each URL mutation (add, delete, update, clear), the same read-all + send-message pair is repeated in 4 places.

**Fix:** Export `readAllUrlArrays()` from `stored-url-entries.js`. Extract `notifyContentScriptOfUrlChange()` combining both steps. Import where needed.

**Files:** `stored-url-entries.js`, `buttons.js`, `popup.js`

### 3.2 Remove `{ response: ... }` wrapper from content script

**Problem:** Content script handlers return `Promise.resolve({ response: value })`, and the popup unwraps with `response.response`. This double nesting adds noise in `handleButtonRecheck`, `handleButtonScroll`, and `handleButtonShowSources`.

**Fix:** Return values directly: `Promise.resolve(analysis.sourcesSummary)`. Popup reads `response` directly (browser API wraps the return).

**Files:** `check-and-border.js`, `buttons.js`, `ui.js`, tests

### 3.3 Replace numeric DetectionState with string keys in messages

**Problem:** `DetectionState` enum is defined in `constants.js` and shared as a global between content script and background script. Content script sends numeric values (0, 1, 2), which are magic numbers in the message. This global sharing will break in Manifest v3 (service workers).

**Fix:** Content script sends string appearance keys (`"specialFound"`, `"found"`, `"none"`) instead of numeric enum values. Background uses the strings directly for icon appearance lookup. Removes the coupling between files and prepares for Manifest v3 migration.

**Files:** `check-and-border.js`, `background.js`, `constants.js`, tests

### 3.4 Remove unused `command` field from background message

**Problem:** Background sends `{ command: "buttonRecheck", info: "protocolOk" }` but the content script routes only on `message.info`. The `command` field is never read anywhere.

**Fix:** Send only `{ info: "protocolOk" }`.

**Files:** `background.js`, tests

### 3.5 Move referer reading to background script

**Problem:** Content script sends `referers: state.refererSources` in its message to the background. The background uses this for redirect checks. But referers come from `browser.storage.local` — the background could read them directly, simplifying the message.

**Fix:** Background reads referers from storage when processing the content script message. Content script message simplifies to `{ detectionState, locationUrl }`.

**Files:** `background.js`, `check-and-border.js`, tests

### 3.6 Remove `URL_TYPE_*` from constants.js

**Problem:** `URL_TYPE_BLACKLIST`, `URL_TYPE_NOTIFY`, `URL_TYPE_REFERER` are defined in `constants.js` as globals. The content script no longer uses them (storage migration to array format already happened). They're only needed by the popup (`url.js` re-declares them as ES module exports).

**Fix:** Remove `URL_TYPE_*` from `constants.js`. Update tests that import from there.

**Files:** `constants.js`, tests

**Depends on:** 3.5 (referers no longer passed in message)

### 3.7 Dead code cleanup in background.js

**Problem:** Commented-out `browserAction.onClicked` listener (lines 5-8). Typo "temporaly" → "temporarily" (line 102).

**Fix:** Remove dead code, fix typo.

**Files:** `background.js`

## Phase 4: Test Improvements (Deferred)

Coverage gaps, missing test files, and test quality — to be discussed later.

---

## Previously Planned Items (Keep for Reference)

### Update to Manifest v3

When this is done, undo these changes because v3 supports ES6 imports:
- Drop src/constants.js file and from the manifest.json file, then include the imports in src/content_scripts/check-and-border.js (at the moment, the values in src/constants.js are available globally since they have been added to the manifest).
