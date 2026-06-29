# Installation

## Firefox

Install the extension from the official Mozilla Add-ons website:

<https://addons.mozilla.org/es/firefox/addon/check-iframe/>

## Firefox for Android

See [Work in Android device](how-to-use/work-in-android-device.html) for installation and usage instructions.

## Chrome / Chromium

This extension is not published in the Chrome Web Store. To install it as an unpacked extension:

1. Run `npm run build` to generate the `dist/chrome/` folder.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked".
5. Select the `dist/chrome/` folder of this project.

Unpacked extensions in Chrome persist across browser restarts. They remain installed until you explicitly remove them.

Keep in mind:

- Don't move or delete the `dist/chrome/` folder — Chrome references it from its original location.
- After making code changes, run `npm run build` again and click the refresh icon on the extension card in `chrome://extensions/` to reload it.

## Documentation links

[Extension documentation home page](https://cmoli.es/projects/check-iframe/introduction.html).
