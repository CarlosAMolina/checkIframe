# Plan: Improve checkIframe — Priorities

## Priority Order

1. **Red flags** — Wrong/buggy JavaScript code that could cause runtime errors or unexpected behavior
2. **Code quality** — Bad practices, misleading names, wrong structure/hierarchy, misplaced code
3. **Architecture** — How files are connected and interact (deferred to a later discussion)
4. **Tests** — Coverage gaps and test improvements (deferred to a later discussion)

---

### 1.6 `refererSources` not updated in `handleSourcesUpdate` — check-and-border.js

**File:** `src/content_scripts/check-and-border.js` lines 174-184

`handleSourcesUpdate` updates `blacklistedSources` and `notifySources` from the message, but never updates `refererSources`. The referer entry is silently ignored. This means referer changes from the popup don't take effect until the page is reloaded.

### 1.7 `deactivateLogs` missing `.catch()` — buttons.js

**File:** `src/popup/buttons.js` line 446-449

`deactivateLogs` calls `browser.tabs.sendMessage(...)` without `.catch()`, while `activateLogs` (line 437-442) does have `.catch(console.error)`. Same inconsistency exists in `activateHighlightAllAutomatically` (line 518-522, no `.catch()`) vs `deactivateHighlightAllAutomatically` (line 525-531, has `.catch()`). Unhandled promise rejections can crash the extension.

### 1.8 `ButtonDelete.click()` fragile DOM traversal — buttons.js

**File:** `src/popup/buttons.js` line 367

`this._event.target.parentNode.parentNode.parentNode.removeChild(this._event.target.parentNode.parentNode)`

This triple-parentNode chain is extremely fragile. If the HTML structure changes or the click target is different (e.g., clicking the `<img>` inside the button vs the `<button>` itself), this will remove the wrong element or throw. Should use `element.closest()` instead.

### 1.9 `ButtonUpdate._updateEntry` race condition — buttons.js

**File:** `src/popup/buttons.js` lines 635-647

```js
_updateEntry() {
    urls = addUrl(...);
    this._repository.save(...).then(() => {
        urls = deleteUrl(...);
        this._repository.delete(...).then(() => { ... });
    });
    sendMessage(Message("urls", urls));  // Runs BEFORE save completes!
    setUrls(urls);                       // Runs BEFORE delete completes!
}
```

`sendMessage` and `setUrls` execute immediately, before the async `save`/`delete` chain completes. The message is sent with stale data (has the added URL but still has the old URL that hasn't been deleted yet).

### 1.10 `saveUrls` mutates the `urlsInput` parameter — buttons.js

**File:** `src/popup/buttons.js` line 74

`urlsInput = [...new Set(urlsInput)]` reassigns the parameter. While not a mutation of the original array (it creates a new one), the parameter name `urlsInput` suggests it's input-only. More importantly, `saveUrls` sends a message inside the loop for each URL (line 85), which means the content script gets multiple intermediate states. This could be batched.

### 1.11 `showSources` receives `tagSummary` with wrong shape from `ButtonRecheck` — buttons.js vs content script

**File:** `src/popup/buttons.js` line 124

`ButtonRecheck.click()` calls `sendMessage(Message("buttonRecheck"))` and then `.then((tagSummary) => { showSources(tagSummary); })`. But the content script's `handleButtonRecheck` returns `analysis.sourcesSummary` (which has `{ iframe: {...}, frame: {...} }` shape). Meanwhile `ButtonShowSources.showSources()` (line 184) does `response.response` to unwrap it. So `ButtonRecheck` passes the raw `sourcesSummary` to `showSources()`, while `ButtonShowSources` unwraps `response.response` first. This inconsistency means `ButtonRecheck` passes the correct shape, but `ButtonShowSources` wraps it differently — both work but the asymmetry is confusing and fragile.

### 1.12 `popup.js` captures `urlType` at init time but uses it in async handler — popup.js

**File:** `src/popup/popup.js` lines 19, 29

`const urlType = getUrlTypeActive()` is called once during `popupMain()`, but the Enter-key handler uses this captured value. If the user changes the radio button selection, the old `urlType` is still used for Enter-key submissions. `ButtonAddUrl.click()` correctly calls `getUrlTypeActive()` at click time, so the "Add" button works correctly but the Enter key doesn't.

---

## Phase 2: Code Quality Improvements

### 2.1 `var urls` module-level mutable state — url.js

**File:** `src/popup/url.js` line 7

`var urls = []` is the only remaining `var` in the codebase. Should be `let`. More importantly, this module-level mutable state (`getUrls`/`setUrls` as getter/setter) is an anti-pattern. The data should flow through function parameters or a proper state object.

### 2.2 Misleading function name `setUirror` — ui.js

**File:** `src/popup/ui.js` line 27

`setUirror` is a typo — likely meant `setUiError`. Very confusing name.

### 2.3 `Message` factory function vs class inconsistency — model.js

**File:** `src/popup/model.js`

`Message` is a plain function (factory), while `UrlsOfType` is a class. Both are data models. Should be consistent — either both functions or both classes.

### 2.4 Duplicated `DetectionState` enum — background.js and check-and-border.js

**Files:** `src/background_scripts/background.js` line 1-5, `src/content_scripts/check-and-border.js` line 1-5

The exact same enum is defined in two files. If one changes without the other, it's a silent bug. Should be in `constants.js` (or equivalent shared location).

### 2.5 Duplicated URL type constants — constants.js and url.js

**Files:** `src/constants.js` and `src/popup/url.js` lines 4-6

Same values defined twice. The content script uses the globals from `constants.js`, the popup uses the ES module exports from `url.js`. Same risk of divergence.

### 2.6 `buttons.js` is too large (769 lines) — mixed responsibilities

**File:** `src/popup/buttons.js`

This file contains 14+ button classes, the `saveUrls` function, `showStoredInfo` DOM builder, `showStoredUrlsType`, `getIsStoredOn`, and `removeShownStoredUrls`. Many of these are not button logic. Should be split.

### 2.7 `showStoredInfo` builds complex DOM imperatively — buttons.js

**File:** `src/popup/buttons.js` lines 552-595

This function creates DOM elements, attaches event listeners, and manages display/edit states. It is tightly coupled to both the DOM structure and multiple button classes. Should be extracted to a UI module.

### 2.8 OnOffButton subclasses have massive code duplication — buttons.js

**File:** `src/popup/buttons.js`

`ButtonShowLogs`, `ButtonHighlightAllAutomatically`, and `ButtonAlwaysShowSources` all follow the same pattern: check `isOn`, toggle style, query tabs, send message, save to storage. The toggle+persist+notify logic should be in `OnOffButton` base class.

### 2.9 `removeShownStoredUrls` is a trivial wrapper — buttons.js

**File:** `src/popup/buttons.js` lines 709-712

```js
function removeShownStoredUrls(infoContainer) {
    removeChildren(infoContainer);
}
```

This adds zero value. Already marked with a TODO to deprecate.

### 2.10 `_setStyle` calls `document.getElementById` 4 times for same element — buttons.js

**File:** `src/popup/buttons.js` lines 235-240

Should query the element once and reuse the reference.

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

### 2.15 Self-referencing import path in buttons.js — buttons.js

**File:** `src/popup/buttons.js` lines 21-23

```js
import { URL_TYPE_BLACKLIST } from "../popup/url.js";
import { URL_TYPE_NOTIFY } from "../popup/url.js";
import { URL_TYPE_REFERER } from "../popup/url.js";
```

These imports use a relative path `../popup/url.js` from within the `popup/` directory. Should be `./url.js` like the other imports from the same file on lines 3-6.

---

## Phase 3: Architecture Improvements (Deferred)

How files are connected and interact — to be discussed later.

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
