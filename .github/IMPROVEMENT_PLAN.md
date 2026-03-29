# Plan: Improve Code and Tests for checkIframe

## Problem Statement

The checkIframe Firefox WebExtension has solid fundamentals (114 passing tests, clean architecture) but has coverage gaps and opportunities to improve test quality. Key issues:

1. **Missing test files**: `log.js` and `repository.js` have no test coverage
2. **Weak test coverage**: Existing tests may have gaps in edge cases and error scenarios
3. **Related blockers**: ESLint v10 configuration needs migration from `.eslintrc.json` to `eslint.config.js`
4. **Technical debt**: Legacy code (15 `var` in background.js vs 1 `let/const`) and TODO comments throughout

## Approach

Focus on **increasing test coverage comprehensively** while unblocking linting to enable CI/CD verification:

1. **Unblock ESLint** - Migrate from `.eslintrc.json` (old format) to `eslint.config.js` (new ESLint v9+ format). The project is using ESLint v10.1.0 but has outdated `.eslintrc.json` config. The new format is required for ESLint v9+.
2. **Add missing tests** - Create test files for `log.js` and `repository.js`
3. **Analyze and improve existing tests** - Review 10 test files for weak coverage
4. **Document coverage gaps** - Identify functions/branches with insufficient testing

## Todos

### Phase 1: Unblock ESLint (blocker for other work)
- `migrate-eslint-config` - Migrate from .eslintrc.json to eslint.config.js to support ESLint v10+

### Phase 2: Add Missing Test Files
- `test-log-module` - Create test/popup/log.test.js covering error reporting functionality
- `test-repository-module` - Create test/popup/repository.test.js covering browser API wrapper

### Phase 3: Analyze & Improve Existing Tests
- `analyze-existing-tests` - Review each of 10 existing test files for edge cases, error scenarios, branch coverage
- `improve-popup-tests` - Enhance popup.test.js with missing scenarios
- `improve-ui-tests` - Enhance ui.test.js with missing scenarios
- `improve-buttons-tests` - Enhance buttons.test.js with missing scenarios
- `improve-background-tests` - Enhance background.test.js with missing scenarios

### Phase 4: Validation & Cleanup
- `validate-coverage` - Run full test suite, verify no regressions
- `document-coverage-gaps` - Create a summary of any remaining gaps

## Key Files & Modules

**Test Fixtures & Utilities:**
- test/fake.js - Browser API mock, fakeBrowser() function
- test/builder.js - HtmlBuilder for constructing expected HTML in tests

**Untested Modules:**
- src/popup/log.js - Error reporting (no test file)
- src/popup/repository.js - Browser API wrapper (no test file)

**Modules to Improve:**
- src/popup/popup.js - Main orchestrator (currently 112 tests, likely has gaps)
- src/popup/ui.js - DOM manipulation (currently 63 tests, likely has gaps)
- src/popup/buttons.js - Button hierarchy (currently 35 tests, likely has gaps)
- src/background_scripts/background.js - Background script (20 tests, likely has gaps)

## Notes

- All 114 tests currently pass (no test failures to fix, only coverage to add)
- ESLint v10 migration is a blocker - must happen first
- Test infrastructure is solid (Jest + JSDOM + rewire for private functions)
- May discover TODOs during implementation that should be addressed alongside tests
