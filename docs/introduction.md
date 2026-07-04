# Check Iframe

## Introduction

Thank you for using this extension!

This is a browser extension (compatible with Firefox and Chrome/Chromium) to work with iframe and frame tags:

- Indicate if the current web page uses iframe and frame tags by changing the colour of the extension icon.
- Scroll the window to the elements with tags and highlight them with a red border.
- Redirection. A list of sites where the extension will apply a redirection automatically to the first iframe/frame source can be configured.

Click on the extension icon to work with a pop-up window that gives you details and allows you to configure the extension.

### Extension notifications

Hover your mouse over the icon to see a description of the result.

The meaning of the icon's colours is: 

- Blue icon: automatic detection is off, the page has not been scanned yet.
- Gray icon: the website cannot be checked.
- Green icon: no iframe or frame tag detected.
- Orange icon: tag detected.
- Purple icon: tag detected and at least one source matches any term in the configured user's list of special sources to notify.

### How the extension detects iframes

The extension does not parse HTML, it uses the DOM API to query the browser's live DOM tree for `<iframe>` and `<frame>` elements.

This means it works on the fully rendered page, rather than doing static HTML text parsing.

## Table of contents

- [Introduction](#introduction)
- [Installation](installation.html)
- [Permissions](permissions/permissions.html)
- Extension popup options:
  - Actions:
    - [Recheck tags](popup-options/recheck.html)
    - [Scroll](popup-options/scroll.html)
    - [Clean border](popup-options/clean-border.html)
    - [Show tags info](popup-options/show-tags-info.html)
  - Configuration:
    - [Always show tags info](popup-options/configuration/always-show-tags-info.html)
    - [Automatic detection](popup-options/configuration/automatic-detection.html)
    - [Automatic highlighting](popup-options/configuration/automatic-highlighting.html)
    - [Blacklisted URLs](popup-options/configuration/blacklisted-urls.html)
    - [Logs](popup-options/configuration/logs.html)
    - [Redirection](popup-options/configuration/redirection.html)
    - [Special sources to notify](popup-options/configuration/sources-to-notify.html)
- [Work in Android device](popup-options/work-in-android-device.html)
- [Frequently Asked Questions](faq.html)
- [Development](popup-options/development.html)
- [Resources](resources/resources.html)
