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

1. Run `npm run build`.
2. Open `chrome://extensions/`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `dist/chrome/` folder.

## Documentation links

[Extension documentation home page](https://cmoli.es/projects/check-iframe/introduction.html).
