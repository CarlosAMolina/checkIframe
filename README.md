# checkIframe

## Introduction

Firefox add-on that indicates if the current web page uses iframe and frame tags by changing the colour of the add-on icon.

Tags are checked with the JavaScript function document.getElementsByTagName().

## Addon notifications

Set the mouse over the icon to see a description of the result. Icon colours: 

- Blue icon: the website cannot be checked.
- Green icon: no tag iframe or frame detected.
- Orange icon: tag detected.
- Purple icon: tag detected and at least one source matches with any term in user's list.

## Addon options

Click on the add-on icon to work with a pop-up window that gives you details and allows you to configure the addo.

### Recheck tags 

This is sometimes necessary when a new configuration has been added to the addon and the website cannot be checked automatically.

### Scroll

Scroll the window to the elements with iframe/frame tags and highlight them with a red border.

### Logs

Enable or disable logs in the web browser console.

### Special sources to notify

Create and modify a list with terms to search in the sources of the elements and notify with the add-on icon using a different colour.

All urls that contains the specified terms will be notified.

### Blacklisted URLs

Create and modify a blacklist of sources that should not be listed / bordered.

Only URLs that match exactly what you specified will be blacklisted.

### Redirection

The user can specify a list of sites where the addon will apply a redirection automatically to the first iframe/frame source.

If the current tab URL contains any term in the list, it will be redirected to the first iframe/frame URL of the page.

Note. If the first iframe/frame URL should not be used as the redirection location, you can add it to the blacklist and will be omitted.

## Permissions

### activeTab and tabs

A background script will listen for tab, window and url events and update the add-on icon.

### Storage

To save the addon configuration.

## Download link:

- https://addons.mozilla.org/es/firefox/addon/check-iframe/

## Resources

### Code

- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_second_WebExtension
- https://github.com/mdn/webextensions-examples (bookmark-it, find-across-tabs, quicknote...)
- Toggle Switch https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_switch

### Images

- See icons/LICENSE

