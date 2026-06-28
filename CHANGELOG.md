# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0] - TODO

### Added
- Add option to disable automatic iframe detection. A blue icon indicates automatic detection is off, distinguishing it from gray, which indicates an unsupported page.
- Add Chrome/Chromium compatibility. The extension now works on Firefox and Chrome-based browsers.
- Add internal debug logging, disabled by default. It can be enabled manually by changing the `debug` variable in `src/logger.js`.

### Changed
- Modernize popup UI.
- Replace `babel-plugin-rewire` with explicit `_forTesting` exports, removing the abandoned dependency.
- Update development dependencies.
- Add import sorting during development.
- Convert content script to an ES module and use the shared logger.

### Fixed
- Fix automatic detection on Firefox for Android. The background script crashed on startup because `browser.windows` is unsupported on Android, preventing event listeners from registering.
- Replace unsafe `innerHTML` and `insertAdjacentHTML` usage with safe DOM manipulation in the popup.
- Fix long URLs overflowing the popup width.
- Fix ESLint error: `URL` is not defined.
- Update GitHub Copilot instructions.

## [2.0.0] - 20260620
### Added
- Display the URL of the highlighted element in the scroll information.

### Changed
- Update Manifest V2 to V3.
- Refactor the code to improve readability and simplify implementation.
- Add .github/copilot-instructions.md to provide Copilot with project-specific development guidelines.

### Fixed
- Update development dependencies to address vulnerabilities and deprecations.
- When clicking Copy with an empty URL, copy an empty string instead of the pop-up window’s URL.
- Avoid the error `Could not establish connection. Receiving end does not exist.` in pages that can be analyzed. For example, https://addons.mozilla.org cannot be analyzed by the add-on.
- Add-on icon update when configuration changes and the user switches tabs/windows.

## [1.8.0] - 2026-01-09
### Added
- Button to always display sources information.

### Changed
- Recheck button. Do not hide sources information if this data was displayed before clicking the button.
- Refactor code.

## [1.7.0] - 2025-12-14
### Added
- Copy button for each (i)frame URL.
- Docs folder.

## [1.6.0] - 2024-09-08
### Added
- Automatic highlighting (i)frames.

### Changed
- Improve front (nicer front).
- Front text:
  - Improve the (i)frames informative text of the popup.
  - Improve the text of the icon titles.
  - Change some text.
- Popup icon gray instead of blue.
- Now the popup shows a message and the configuration button when the web page cannot be analyzed.
- Change front switches to buttons.
- More efficient popup attributes.
- The sources configuration is hidden until any radio button is clicked.
- Refactor code. For example, extract code to new files.
- Update docs.

### Fixed
- Add horizontal scrollbar in case of long paragraphs, to avoid paragraphs outside the parent elements.

## [1.5.0] - 2024-08-16
### Added
- Android support.

## [1.4.2] - 2024-08-16
### Added
- Tests.
- Changelog file.
- package.json: added development tools like eslint, prettier, web-ext, pre commit, etc.

### Changed
- Refactor code:
  - Extract functions.
  - Extract classes.
  - Move code.
  - Inline variables.
- Organize code in folders.
- Format code with prettier.
- Improve variable types.
- Update README.md.
- Change create zip result path.

## [1.4.1] - 2021-02-08
### Fixed
- Detect button if its image has been clicked.

## [1.4.0] - 2021-02-07
### Added
- Automatic opening of first iframe source on sites selected by user.

## [1.3.2] - 2018-07-06
### Changed
- Input box width when editing a value.

## [1.3.1] - 2018-01-26
### Added
- Feature check HTML tags frame and iframe.
