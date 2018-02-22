# checkIframe

Firefox add-on that indicates if the current website uses an iframe by changing the color of the add-on icon.

A background script will listen for tab, window and url events and update the add-on icon.

Place the mouse over the icon to see the result. Click icon to recheck.

- Blue icon: not checked
- Yellow icon: the website may have an iframe
- Empty icon: no iframe

The addon can scroll the window to the iframe element and highlight it with a red border (you must uncomment these lines).

To see what the add-on is doing, check the consoles' logs


Download link:

- https://addons.mozilla.org/es/firefox/addon/check-iframe/