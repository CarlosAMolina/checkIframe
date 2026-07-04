# Permissions

## Web browser settings

### Enable extension permissions

To ensure that the extension has all the permissions it needs to function, for example, in Firefox, go to `about:addons`, click the extension and, on the `Permissions and Data` tab, enable `Access your data on all websites`; this is necessary to analyze the DOM elements of web pages.

The `Access your data on all websites` permission is required because the extension uses broad host permissions (`https://*/*`, `http://*/*`, `file:///*`) to automatically insert the content script into every page, so you don't have to click the extension icon to detect iframe tags.

## Permissions used by the extension.

### activeTab and tabs

A background script will listen for tab, window and URL events and update the extension icon.

### Storage

Used to save the extension configuration.

## Documentation links

[Extension documentation home page](https://cmoli.es/projects/check-iframe/introduction.html).
