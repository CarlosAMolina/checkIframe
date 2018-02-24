# checkIframe

Firefox add-on that indicates if the current website uses one or more iframes by changing the color of the add-on icon.

Place the mouse over the icon to see the result. Icon colors: 

- Blue icon: not checked
- Orange icon: the website has an iframe
- Green icon: no iframe

Click on the icon to work with a pop-up window that allows you to recheck or scroll the window to the iframe elements and highlight them with a red border.

A background script will listen for tab, window and url events and update the add-on icon.

To see what the add-on is doing, check the consoles' logs.


Download link:

- https://addons.mozilla.org/es/firefox/addon/check-iframe/


Resources, code:

- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_second_WebExtension
- https://github.com/mdn/webextensions-examples (bookmark-it, find-across-tabs...)

Resources, images:

- See icons/LICENSE