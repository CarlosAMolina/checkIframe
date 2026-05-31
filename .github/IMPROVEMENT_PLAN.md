# Plan: Improve checkIframe — Priorities

## Priority Order

3. **Architecture** — How files are connected and interact (deferred to a later discussion)
4. **Tests** — Coverage gaps and test improvements (deferred to a later discussion)

---

## Phase 3: Architecture Improvements

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
