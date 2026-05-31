# Copilot Instructions for checkIframe

## Quick Reference

**Build/Run/Test:**
- `npm run lint` - Run ESLint on src/ and test/
- `npm run lint:fix` - Auto-fix linting issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Auto-format code
- `npm test` - Run all Jest tests
- `npm run testfilter -- -t "TestName"` - Run single test by name (or use `npm run testfilter -t ButtonScroll` as example)
- `npm run web-ext` - Run the add-on in Firefox for manual testing (opens a test page with iframes)

## Project Architecture

**checkIframe** is a Firefox WebExtension (Manifest v2) that detects iframe/frame elements on web pages, lets the user scroll through and highlight them, and optionally auto-redirects to the first iframe source on configured sites.

### Directory Structure

- **src/manifest.json** - WebExtension manifest (Manifest v2)
- **src/constants.js** - Shared global constants (`URL_TYPE_BLACKLIST`, `URL_TYPE_NOTIFY`, `URL_TYPE_REFERER`); loaded by the manifest before the content script so both content script and popup can access the same values
- **src/background_scripts/** - Background script (`background.js`) handling browser API events, tab state, icon appearance, and redirection
- **src/popup/** - Popup UI (HTML/CSS/JS modules) shown when the user clicks the add-on icon
- **src/content_scripts/** - Content script (`check-and-border.js`) injected into web pages to detect, highlight, and scroll to iframes/frames
- **src/icons/** - Add-on icons: `addonIcon.png` (main icon), colored status icons (`i_gray.png`, `i_green.png`, `i_orange.png`, `i_purple.png`), and SVG button icons (`recheck.svg`, `locate.svg`, `noHighlight.svg`, `copy.svg`, `ok.svg`, `trash.svg`, `cancel.svg`)
- **test/** - Jest tests mirroring src/ structure, plus test utilities (`fake.js`, `builder.js`)
- **test-manual/** - Manual test fixtures (e.g., `redirection-loop/` for testing redirect infinite loops)
- **docs/** - User-facing documentation (introduction, permissions, how-to-use guides, resources)
- **create_zip/** - Build artifacts / zip creation

### Core Architecture

#### 1. Background Script (`src/background_scripts/background.js`)

Runs as a persistent background page. Uses global `const`/`function` declarations (not ES modules, not CommonJS).

- **Tab state tracking**: Maintains a `tabState` Map keyed by tab ID, storing `{ url, appearanceKey }` per tab. Used to deduplicate updates (`wasAlreadyProcessed`) and to restore the correct icon when switching tabs (`refreshTabIcon`).
- **Event listeners**: Listens to `browser.windows.onFocusChanged`, `browser.tabs.onUpdated` (fires on `changeInfo.status === "complete"`), `browser.tabs.onActivated`, and `browser.tabs.onRemoved` (cleanup).
- **Message listener**: Receives messages from the content script with `{ detectionState, referers, locationUrl }`. Based on this it determines icon appearance and triggers redirection if the current tab URL matches any referer source.
- **Icon appearance**: Uses a `TAB_APPEARANCE` lookup object mapping keys (`unsupported`, `specialFound`, `found`, `none`) to `{ title, icon }` pairs. The `appearanceKeyFromDetection` function maps a `DetectionState` enum + protocol support to the correct key.
- **Redirection**: If `checkRunRedirect` finds the tab URL contains any referer source (case-insensitive) and a `locationUrl` was provided, it redirects the tab using `browser.tabs.update`.
- **Protocol support**: Only `https:`, `http:`, and `file:` protocols are supported. Unsupported protocols get the gray icon.
- **DetectionState enum**: `{ NONE: 0, FOUND: 1, SPECIAL_FOUND: 2 }` — duplicated in both background.js and content script.

#### 2. Content Script (`src/content_scripts/check-and-border.js`)

Injected into every web page matching `https://*/*`, `http://*/*`, `file:///*`. Loaded after `constants.js` (which provides URL_TYPE_* globals). Uses an IIFE with a `window.hasRun` guard to prevent double-initialization.

**State**: Maintains a local `state` object:
- `blacklistedSources`, `notifySources`, `refererSources` — arrays of user-configured URL fragments loaded from `browser.storage.local` on init
- `highlightAllAutomatically` — boolean, persisted in storage
- `showLogs` — boolean, persisted in storage
- `indexToHighlight` — integer for cycling through elements with the scroll button

**Message handlers** (keyed by `message.info`):
- `protocolOk` / `buttonRecheck` — scans the page for `<iframe>` and `<frame>` elements, sends detection results to the background script, highlights if automatic highlighting is enabled
- `buttonScroll` — cycles through non-blacklisted elements, scrolling and highlighting one at a time
- `buttonClean` — removes all highlights
- `buttonShowSources` — returns a summary of detected sources
- `buttonShowLogs` / `buttonHighlightAllAutomatically` — toggle state flags
- `urls` — updates blacklist/notify sources from popup changes

**Key functions**:
- `getPageElements()` — collects all `<frame>` and `<iframe>` nodes with their `src` attribute
- `getNonBlacklistedElements()` — filters out elements whose source contains any blacklisted string (case-insensitive)
- `isThereAnySourceToNotify()` — checks if any element source matches a notify string
- `getDetectionState()` — returns `SPECIAL_FOUND` if notify matches, `FOUND` if any elements exist, `NONE` otherwise
- `highlight()`/`unhighlight()` — adds/removes a CSS class (`check-iframe-detector-highlight`) that applies a `10px solid red` outline via an injected `<style>` element

#### 3. Popup System (`src/popup/`)

Uses **ES6 modules** (`import`/`export`). Entry point: `popup.html` loads `popup.js` as `type="module"`.

**Files and responsibilities:**

- **popup.js** — Main entry point. Calls `initializePopup()` which sets max-width, initializes buttons, loads stored URLs from storage and sends them to the content script. Sets up the textarea `keyup` listener for Enter-key URL submission.

- **buttons.js** — Contains all button classes (~770 lines, the largest file):
  - `Button` (abstract base) — provides `click()` and `_logButtonName()`, requires `_idHtml` getter
  - `DynamicButton` (abstract base) — for buttons created dynamically in the DOM (provides `static createDom()`)
  - `OnOffButton extends Button` — toggle buttons with on/off visual states (green/gray), persisted to storage. Provides `initializePopup()`, `setStyleOn()`/`setStyleOff()`, `isOn` getter, `getIsStoredOn()`
  - Concrete `Button` subclasses: `ButtonRecheck`, `ButtonScroll`, `ButtonShowConfig`, `ButtonShowSources`, `ButtonClean`, `ButtonAddUrl`, `ButtonClearAll`
  - Concrete `OnOffButton` subclasses: `ButtonShowLogs`, `ButtonHighlightAllAutomatically`, `ButtonAlwaysShowSources`
  - Concrete `DynamicButton` subclasses: `ButtonDelete`, `ButtonUpdate`, `ButtonCancel`
  - `UrlsOfTypeButton extends Button` — base for URL type radio buttons; subclasses: `ButtonUrlsBlacklist`, `ButtonUrlsNotify`, `ButtonUrlsReferer`
  - `initializePopupButtons()` — maps HTML element IDs to button class constructors, attaches click listeners, and calls `initializePopup()` on the three OnOffButtons
  - `saveUrls()` — exported function to save URLs to storage, update in-memory state, and render entries
  - `showStoredInfo()` — renders a stored URL entry with delete/edit/cancel/update buttons

- **ui.js** — DOM manipulation for displaying detected sources: `showSources()` renders HTML into `.sources-container`, `setupSourcesCopyButtonListeners()` adds copy-to-clipboard behavior with tooltip feedback. Exports `infoContainer` (the `.info-container` element) and `getUrlsInInputBox()`.

- **dom.js** — Generic DOM helpers: `hide()`, `unhide()`, `isHidden()`, `toggleHide()`, `removeChildren()`, `setNewElementsMaxWidth()`, `updateElementsWhenIncompatibleWebPage()`.

- **model.js** — Data models:
  - `Message(info, values)` — factory function creating `{ info, values? }` message objects
  - `UrlsOfType` — class with `type` and `values` properties

- **message-mediator.js** — `sendMessage(message)` queries the active tab and calls `browser.tabs.sendMessage()`. On error, calls `updateElementsWhenIncompatibleWebPage()`.

- **repository.js** — `BrowserRepository` class wrapping `browser.storage.local` with `get()`, `getAll()`, `save()`, `delete()`, and `isStored()` methods.

- **url.js** — URL type management:
  - Defines `URL_TYPE_BLACKLIST`, `URL_TYPE_NOTIFY`, `URL_TYPE_REFERER` (same values as `constants.js` but as ES module exports)
  - `getStoredUrls(browser)` — reads all storage, groups entries by URL type prefix, returns `UrlsOfType[]`
  - `addUrl()` / `deleteUrl()` — modify in-memory URL arrays
  - `getUrlTypeActive()` — reads which radio button is checked in the popup
  - Module-level `var urls` — mutable in-memory state (legacy pattern)

- **tags-html.js** — HTML generation: `getStrTagsHtml()` builds an HTML string showing frame/iframe counts, blacklisted status, and a numbered list of source URLs with copy buttons.

- **log.js** — `reportError(error)` — logs to `console.error`.

- **popup.css** — Styles for the popup UI. Uses CSS custom properties for dimensions. Key classes: `.hidden`, `.backgroundGray`, `.oneLineButtons`, `.switchConfig`, `.sourceConfig`, `.detections`, `.tooltip`.

### Message Flow

```
Popup (popup.js / buttons.js)
  ├── sendMessage(Message) ──→ Content Script (check-and-border.js)
  │     via browser.tabs.sendMessage
  │     Messages: buttonRecheck, buttonScroll, buttonClean, buttonShowSources,
  │               buttonShowLogs, buttonHighlightAllAutomatically, urls
  │     Returns: Promise with response data (sourcesSummary, scroll info, etc.)
  │
  └── Content Script ──→ Background Script (background.js)
        via browser.runtime.sendMessage
        Message: { detectionState, referers, locationUrl }
        Background uses this to set icon appearance and trigger redirects

Background Script ──→ Content Script
  via browser.tabs.sendMessage
  Messages: { command: "buttonRecheck", info: "protocolOk" } (on tab update/activation)
```

### Storage Keys

All persistent data uses `browser.storage.local`:

- **URL entries**: `{type}_{value}` format (e.g., `blacklist_ads.example.com`, `notify_tracking`, `referer_mysite.com`). The key prefix determines the URL type.
- **Settings (booleans)**: `idShowLogs`, `idHighlightAllAutomatically`, `idTagsInfoAlwaysVisible`

## Testing Patterns

Tests use **Jest** with **JSDOM** for DOM simulation and `babel-plugin-rewire` for testing non-exported functions.

### Test Setup

- **test/fake.js** — Provides:
  - `fakeBrowser(config)` — creates a mock browser object with jest.fn() stubs for `browserAction`, `runtime`, `storage.local`, `tabs`, and `windows`. Accepts optional `config` with `sendMessageResponse` and `storageItems`.
  - `mockNotEmptySourcesContainer(container)` — adds child elements for testing container clearing
  - `runFakeDom(htmlPath)` — loads an HTML file into JSDOM and sets `global.document`/`global.window`
  - `runNoHtmlFakeDom()` — creates a blank JSDOM
- **test/builder.js** — `HtmlBuilder` class with fluent API for constructing expected HTML strings (used in tags-html tests)
- Tests use `require()` instead of `import` to enable rewire's `__get__()` and `__set__()` for accessing private functions

### Test File Structure

```
test/
├── fake.js                          # Shared test utilities and browser mock
├── builder.js                       # HTML builder for test assertions
├── background_scripts/
│   └── background.test.js           # Background script tests
├── content_scripts/
│   └── check-and-border.test.js     # Content script tests
└── popup/
    ├── buttons.test.js              # Button classes tests
    ├── dom.test.js                  # DOM utility tests
    ├── message-mediator.test.js     # Message sending tests
    ├── model.test.js                # Data model tests
    ├── popup.test.js                # Popup initialization tests
    ├── tags-html.test.js            # HTML generation tests
    ├── ui.test.js                   # UI display tests
    └── url.test.js                  # URL management tests
```

### Example Test Pattern

```javascript
import * as fakeModule from "../fake.js";

describe("myFunction", () => {
  let myModule;
  beforeEach(() => {
    fakeModule.runFakeDom("src/popup/popup.html");  // Load HTML fixture
    global.browser = fakeModule.fakeBrowser();       // Mock browser API
    myModule = require("../../src/popup/ui.js");     // Use require for rewire
  });

  it("should do something", () => {
    const privateVar = myModule.__get__("internalState");  // Access private var
    expect(privateVar).toBe(expectedValue);
  });
});
```

For test files matching **/*.test.js:

- Forbidden: mock the browser, storage, tabs, runtime, or extension APIs with Jest mocks.
- Required: use the project's custom fake browser implementation instead, defined in test/fake.js. Example: global.browser = fakeModule.fakeBrowser().
- Prefer importing and configuring that fake over creating inline mocks.
- If a new API surface is needed, extend the fake browser helper rather than replacing it with jest.mock() or ad hoc mock objects.
- Keep tests compatible with the existing project testing setup.

## Code Conventions

- **Module System**: Popup files use ES6 modules (`import`/`export`). The background script and content script use plain global declarations (no module system) — loaded via the manifest's `scripts` arrays.
- **Shared Constants**: `constants.js` defines URL type constants as globals for the content script. The same values are re-declared as ES module exports in `src/popup/url.js` for the popup.
- **Testing Private Code**: Use `require()` + rewire's `__get__()` / `__set__()` to test unexported functions
- **HTML Fixtures**: Test files load HTML via `runFakeDom("src/popup/popup.html")` from JSDOM
- **Legacy Code**: `url.js` still uses `var urls` (module-level mutable state); new code should use `let`/`const`
- **TODO Comments**: Scattered across files (e.g., `background.js`, `url.js`, `buttons.js`) marking areas for refactoring
- Imports:
  - Must be at the top of the file.
  - Only import one object per line.
- Define functions in top-down order: high-level entry points appear first, helper/internal functions below the functions that call them.
- Do not use comments; use functions or methods with descriptive names instead.
- Do not use blank lines inside a function.
- Format:
  - Do not format existing code, only format new code.

## Style & Format

- **Linter**: ESLint flat config (`eslint.config.mjs`) with `@eslint/js` recommended rules + `eslint-config-prettier` to disable conflicting rules
- **Formatter**: Prettier (excludes HTML files via `.prettierignore`)
- **Pre-commit**: Husky runs `npm run prettier` and `npm test` before commits (see `.husky/pre-commit`)
- **Babel**: `babel-plugin-rewire` (via `babel.config.js`) for test access to unexported code; `@babel/plugin-transform-modules-commonjs` (via `.babelrc`) for Jest compatibility with ES modules
- **Dependency overrides**: `package.json` includes `devDependenciesComments` explaining pinned versions of `brace-expansion` and `node-forge` to fix vulnerabilities in unmaintained transitive dependencies

## Firefox WebExtension Details

- **Manifest v2** (`src/manifest.json`)
- **Permissions**: `activeTab`, `storage`, `tabs`
- **Content script injection**: Runs at `document_end` on `https://*/*`, `http://*/*`, `file:///*` (top frame only, `all_frames: false`). Loads `constants.js` then `content_scripts/check-and-border.js`.
- **Icon States**: Gray (unsupported protocol), Green (no iframes/frames), Orange (iframes/frames found), Purple (special notify sources matched)
- **Browser API**: Uses `browser.*` namespace (Firefox WebExtensions API), not `chrome.*`
