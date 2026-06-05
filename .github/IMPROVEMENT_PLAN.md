# Plan: Improve checkIframe — Priorities

## Priority Order

3. **Architecture** — How files are connected and interact (deferred to a later discussion)
4. **Tests** — Coverage gaps and test improvements (deferred to a later discussion)

---

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
