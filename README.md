# checkIframe

Firefox add-on that indicates if the current web page uses iframe and frame tags by changing the color of the add-on icon.

Tags are checked with the JavaScript function document.getElementsByTagName().

Place the mouse over the icon to see the result. Icon colors: 
- Blue icon: not checked.
- Green icon: no tag detected.
- Orange icon: tag detected.
- Purple icon: tag detected and at least one source matches with any term in user's list.

Click on the add-on icon to work with a pop-up window that allows you to:
- Recheck tags.
- Scroll the window to the elements with tags and highlight them with a red border.
- Enable or disable logs in the web browser console.
- Create and modify a list with terms to search in the sources of the elements and notify with the add-on icon. No case sensitive.
- Create and modify a blacklist of sources that should not be listed / bordered.

A background script will listen for tab, window and url events and update the add-on icon.

Download link:
- https://addons.mozilla.org/es/firefox/addon/check-iframe/

Resources, code:
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension
- https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_second_WebExtension
- https://github.com/mdn/webextensions-examples (bookmark-it, find-across-tabs, quicknote...)
- Toggle Switch https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_switch

Resources, images:
- See icons/LICENSE
