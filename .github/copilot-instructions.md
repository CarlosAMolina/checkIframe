# Copilot Instructions for checkIframe

## Quick Reference

**Build/Run/Test:**
- `npm run lint` - Run ESLint on src/ and test/
- `npm run lint:fix` - Auto-fix linting issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Auto-format code
- `npm test` - Run all Jest tests
- `npm run testfilter -- -t "TestName"` - Run single test by name (or use `npm run testfilter -t ButtonScroll` as example)
- `npm run web-ext` - Run the add-on in Firefox for manual testing

## Project Architecture

**checkIframe** is a Firefox WebExtension (add-on) that detects and navigates iframe/frame elements on web pages.

### Directory Structure

- **src/background_scripts/** - Background script handling browser API events, tab management, and messaging
- **src/popup/** - Popup UI logic and scripts (runs when user clicks the add-on icon)
- **src/content_scripts/** - Content scripts that run on web pages to detect iframes/frames
- **test/** - Jest tests with test utilities and mocks mirroring src/ structure

### Core Architecture

1. **Background Script** (`background.js`):
   - Manages tab state and active tab detection
   - Listens for tab updates/activation via `browser.tabs` API
   - Determines icon color based on iframe detection results
   - Uses `browser.storage.local` for persistent settings

2. **Popup System** (`src/popup/`):
   - Entry point: `popup.js` - Orchestrates UI, button listeners, and messaging
   - `ui.js` - DOM manipulation for displaying iframes/frames list
   - `buttons.js` - Button class hierarchy (Button, DynamicButton, OnOffButton, ButtonDelete, etc.)
   - `dom.js` - DOM utility functions
   - `model.js` - Data models (Message class)
   - `message-mediator.js` - Communication with background script
   - `repository.js` - Browser API wrapper (BrowserRepository)
   - `url.js` - URL storage and filtering logic
   - `tags-html.js` - HTML generation for iframe/frame elements
   - `log.js` - Error reporting

3. **Content Script** (`check-and-border.js`):
   - Injected into web pages
   - Detects iframe and frame elements
   - Sends element info to background script

## Testing Patterns

Tests use **Jest** with **JSDOM** for DOM simulation and `babel-plugin-rewire` for testing non-exported functions.

### Test Setup

- **test/fake.js** - Provides `fakeBrowser()` mock and `runFakeDom(htmlPath)` for DOM setup
- **test/builder.js** - `HtmlBuilder` class for building expected HTML strings in tests
- Tests use `require()` instead of `import` to enable rewire's `__get__()` and `__set__()` for accessing private functions

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

## Code Conventions

- **Module System**: Popup uses ES6 modules; background script uses CommonJS globals
- **Testing Private Code**: Use `require()` + rewire's `__get__()` / `__set__()` to test unexported functions
- **HTML Fixtures**: Test files load HTML via `runFakeDom("src/popup/popup.html")` from JSDOM
- **Legacy Code**: Background script uses `var` declarations; new code should use `let`/`const`
- **TODO Comments**: Look for "TODO" in files (e.g., background.js has TODOs about replacing `var`)
- Imports must be at the top of the file.
- Define functions in top-down order: high-level entry points appear first, helper/internal functions below the functions that call them.
- Do not use comments; use functions or methods with descriptive names instead.
- Do not use blank lines inside a function.
- Format:
  - Do not format existing code, only format new code.

## Style & Format

- **Linter**: ESLint with recommended config (no custom rules)
- **Formatter**: Prettier (excludes HTML files)
- **Pre-commit**: Husky runs lint-staged before commits

## Firefox WebExtension Details

- **Manifest v2** (upgrade to v3 planned or in progress - check manifest.json)
- **Permissions**: activeTab, storage, tabs
- **Icon States**: Gray (error), Green (no iframes), Orange (iframes found), Purple (special URLs matched)
- **Browser API**: Uses `browser.*` namespace (Firefox API), not `chrome.*`
