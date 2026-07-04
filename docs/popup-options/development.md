# Development

## Build

Generate browser-specific builds from the shared source:

```bash
npm run build
```

This creates `dist/firefox/` and `dist/chrome/` directories.

## Testing

### Initial steps

In the same directory as the `package.json` file, install the dependencies:

```bash
npm install
```

### Run tests

```bash
npm test
```

## Run extension in the browser

### Firefox

```bash
npm run web-ext
```

### Chrome / Chromium

See [Installation](../installation.html) for instructions on loading the extension in Chrome.

## Debug logging

The extension has internal debug logs that can be enabled by setting the `debug` variable to `true` in `src/logger.js`. These logs appear in the extension's own debug console (accessible via `about:debugging` in Firefox or `chrome://extensions` in Chrome), not in the web page console.

This is different from the `Show logs in the console` toggle in the popup, which controls whether the content script logs iframe detection activity to the inspected web page's console.

## Documentation links

[Extension documentation home page](https://cmoli.es/projects/check-iframe/introduction.html).
