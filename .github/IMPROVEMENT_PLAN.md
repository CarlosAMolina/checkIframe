# Plan: Improve checkIframe — Priorities

## Priority Order

1. **Red flags** — Wrong/buggy JavaScript code that could cause runtime errors or unexpected behavior
2. **Code quality** — Bad practices, misleading names, wrong structure/hierarchy, misplaced code
3. **Architecture** — How files are connected and interact (deferred to a later discussion)
4. **Tests** — Coverage gaps and test improvements (deferred to a later discussion)

---

## Phase 2: Code Quality Improvements

### 2.11 `ButtonClearAll.click()` queries tabs unnecessarily — buttons.js

**File:** `src/popup/buttons.js` lines 736-742

```js
return browser.tabs.query({ active: true, currentWindow: true })
    .then(() => this._clearStorageInfo(urlType))
```

The tab query result is discarded (the `.then` callback ignores it). This is a pointless async call.

### 2.12 `key.includes(urlType + "_")` is a fragile filter — url.js, buttons.js, check-and-border.js

**Files:** Multiple locations

Using `includes()` instead of `startsWith()` means a key like `notify_blacklist_foo` would match both `notify` and `blacklist` types. Should use `startsWith()` consistently. `getStoredUrls` in `url.js` (line 45) and `showStoredUrlsType` in `buttons.js` (line 702) both use `includes`.

### 2.13 `summaryOfTheHighlightedElement` uses string concatenation — check-and-border.js

**File:** `src/content_scripts/check-and-border.js` lines 226-236

Should use template literals for consistency with the rest of the codebase.

### 2.14 `handleButtonShowLogs` uses truthy values `1`/`0` instead of booleans — buttons.js + check-and-border.js

**Files:** `src/popup/buttons.js` lines 441, 448 and `src/content_scripts/check-and-border.js` line 161

`values: 1` and `values: 0` are sent as message values, then `state.showLogs = message.values` stores the number. This works due to JS truthiness but should use `true`/`false`. Same issue with `buttonHighlightAllAutomatically`.

### 2.12 `key.includes(urlType + "_")` is a fragile filter — url.js, buttons.js, check-and-border.js

**Files:** Multiple locations

Using `includes()` instead of `startsWith()` means a key like `notify_blacklist_foo` would match both `notify` and `blacklist` types. Should use `startsWith()` consistently. `getStoredUrls` in `url.js` (line 45) and `showStoredUrlsType` in `buttons.js` (line 702) both use `includes`.

---

## Phase 3: Architecture Improvements (Deferred)

## Phase 4: Test Improvements (Deferred)

Coverage gaps, missing test files, and test quality — to be discussed later.

---

## Previously Planned Items (Keep for Reference)

### Update to Manifest v3

When this is done, undo these changes because v3 supports ES6 imports:
- Drop src/constants.js file and from the manifest.json file, then include the imports in src/content_scripts/check-and-border.js (at the moment, the values in src/constants.js are available globally since they have been added to the manifest).

### Browser Storage Simplification

Instead of:

    blacklist_google: "google.com"
    blacklist_youtube: "youtube.com"

Store:

    blacklist: ["google.com", "youtube.com"]
    notify: ["twitter.com"]
    referer: ["example.com"]

Then change the code to a more trivial solution:

    browser.storage.local.get({
      blacklist: [],
      notify: [],
      referer: []
    })
    .then(({ blacklist, notify, referer }) => {
      blacklistedSources = blacklist;
      notifySources = notify;
      refererSources = referer;
    })
    .catch(reportErrorContentScript);
