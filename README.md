# checkIframe

## Introduction

Browser extension (Firefox and Chrome/Chromium) to work with `<iframe>` and `<frame>` tags:

- Indicates if the current web page uses `<iframe>` or `<frame>` tags by changing the colour of the extension icon.
- Scrolls to the iframe/frame elements and highlights them with a red border.
- Automatically redirects to the first iframe/frame source on a configurable list of sites.

Click the extension icon to open a popup with details and configuration options.

### Icon colours

Hover over the icon to see a description of the result. The meaning of each colour:

- Gray: the website cannot be checked.
- Green: no `<iframe>` or `<frame>` tags detected.
- Orange: `<iframe>`/`<frame>` tag detected.
- Purple: tag detected and at least one source matches any term in the user-configured list of special sources to notify.

## Installation

### Firefox

You can install the extension at:

<https://addons.mozilla.org/es/firefox/addon/check-iframe/>

### Chrome / Chromium

1. Run `npm run build` to generate the `dist/chrome/` folder.
2. Open `chrome://extensions/` in Chrome.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `dist/chrome/` folder.

## Documentation

Please read the docs to learn how to configure and use the extension:

<https://cmoli.es/projects/check-iframe/introduction.html>

The documentation source files are in the `docs` folder. A separate project converts them into the previous website.
