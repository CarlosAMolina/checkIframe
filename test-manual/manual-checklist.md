Feature: Automatic detection

Scenario: Automatic detection in a new page
  Given the user visits a web page that contains iframes
  When the page is loaded
  Then the extension icon changes to the detection state automatically

Scenario: Automatic detection in a new tab when duplicating
  Given the user is viewing a web page that contains iframes
  When the user duplicates the tab (the browser will change to that new tab)
  Then the extension icon changes to the detection state automatically

Scenario: Automatic detection in different tabs and windows
  Given there are multiple tabs and windows, each one should raise these detections:
    - Web page without iframes.
    - Iframes detected.
    - Iframes to notify.
    - Unmanaged web page. Example: about:debugging#/runtime/this-firefox.
  When the user switches between tabs and windows
  Then the extension icon changes to the detection state automatically:
    - No detections.
    - Detections.
    - Detection to notify.
    - Unmanaged web page.

Scenario: Automatic detection to notify when changing tab and/or window if configuration changes
  Given the user has two tabs open, both with iframes with the same source (example youtube.com, you can open the file [all-types-of-iframes/index.html](all-types-of-iframes/index.html) twice)
  When the user updates the configuration in one tab to notify `youtube.com` and switches to the other tab and/or another window
  Then the extension icon changes to the notify detection state automatically


Feature: Recheck button

Scenario: Recheck button rechecks the page
  Given the user visits a web page
  When the user opens the extension and clicks the button Recheck
  Then the logs show that the extension rechecks the page

Scenario: Recheck button reloads results
  Given the user visits a web page with iframes and opens the extension `Show tags info` box
  When the user adds one iframe to the `Sources to omit` configuration and clicks the recheck button
  Then the text in the `Show tags info` box is updated showing that an iframe is blacklisted


Feature: `Scroll to element` button

Scenario: The button scrolls to the iframes
  Given the user visits a web page that contains iframes
  When the user clicks the `Scroll to element` button
  Then the extension scrolls to each element. Click it twice to verify that the detections loop from the beginning after the last element is reached
  AND the index of the displayed URL matches the index of the URL in the `Show tags info` box

Scenario: The button does not scroll to the iframes if all are blacklisted
  Given the user visits a web page that contains iframes but they are all configured as blacklisted
  When the user clicks the `Scroll to element` button
  Then the extension does not scroll to any element

Scenario: The scroll-applied border is preserved when opening the popup
  Given the user visits a web page that contains iframes
  And the user uses the `Scroll to element` button to highlight an iframe
  When the user closes and reopens the extension popup (clicks the add-on icon)
  Then the scroll-applied border is still visible on the iframe


Feature: `Clean border` button

Scenario: The button drops the border
  Given an iframe is bordered
  When the user clicks the `Clean border` button
  Then the border is dropped


Feature: `Show tags info` button

Scenario: The button shows expected info if no blacklisted urls
  Given the user visits a web page that contains iframes
  When the user clicks the `Show tags info` button
  Then the extension shows the information of all the iframes

Scenario: The button shows expected info if blacklisted urls
  Given the user visits a web page that contains iframes and some of them are blacklisted
  When the user clicks the `Show tags info` button
  Then the extension shows the information of the non-blacklisted iframes

Scenario: The copy button copies the url
  Given the user visits a web page that contains iframes
  When the user clicks the `Show tags info` button and the copy button of one iframe
  Then the iframe is copied to the clipboard


Feature: On/off buttons are persisted

Background: Repeat each scenario multiple times, replacing CONFIGURED_OPTION with:

- Always show tags info
- Automatic highlighting
- Show logs in the console

Scenario: The on/off buttons are stored as on
  Given the user clicks the on/off button CONFIGURED_OPTION
  When the user closes the extension and opens a new browser tab
  Then the clicked CONFIGURED_OPTION remains on

Scenario: The on/off buttons are stored as off
  Given the user clicks the on/off button CONFIGURED_OPTION that is currently on
  When the user closes the extension and opens a new browser tab
  Then the clicked CONFIGURED_OPTION remains off


Feature: `Always show tags info` button works as expected

Scenario: The `Always show tags info` modifies the popup correctly
  Given the extension is open
  When the user clicks the `Always show tags info` button
  Then the `Show tags info` button disappears and its content is shown
  AND this works after closing and reopening the extension


Feature: `Automatic detection` button works as expected

Scenario: Automatic detection modifies the extension icon in new tab/window if the page can be analyzed
  Given the automatic detection option is off
  When the user changes tab or window that can be analyzed
  Then the extension icon must be blue in the new tab/window

Scenario: Automatic detection does not modify the extension icon in new tab/window if the page cannot be analyzed
  Given the automatic detection option is off
  When the user changes tab or window that cannot be analyzed
  Then the extension icon must be grey, not blue

Scenario: Automatic detection does not modifies the extension icon in current tab
  Given the automatic detection option is `on` in a page with or without iframes (the extension icon is orange or green)
  When the user deactivates the automatic detection option
  Then the extension icon does not change to blue, it maintains its previous color
  Note. OK in Firefox. KO in Chrome

Scenario: Automatic detection modifies the extension icon in current tab if the user reloads the page
  Given the automatic detection option is `on` in a page with iframes (the extension icon is orange)
  When the user deactivates the automatic detection option and reloads the page
  Then the extension icon changes to blue

Scenario: Automatic detection acts like recheck when activated on pages that can be analyzed
  Given the automatic detection option is off in a page that can be analyzed
  When the user activates the automatic detection option
  Then the same actions as when clicking the recheck button are triggered: analyze the page and update the icon and info with the results

Scenario: Automatic detection does not recheck when activated on pages that cannot be analyzed
  Given the automatic detection option is off in a page that cannot be analyzed
  When the user activates the automatic detection option
  Then the recheck actions are not triggered (this can be asserted by reviewing the logs)


Feature: `Automatic highlighting` button works as expected

Scenario: The `Automatic highlighting` modifies the popup correctly
  Given the extension is open
  When the user clicks the `Automatic highlighting` button
  Then the `Scroll to element` and `Clean border` buttons disappear
  AND this works after closing and reopening the extension

Scenario: The `Automatic highlighting` highlights all non blacklisted iframes
  Given the user visits a web page that contains iframes
  When the user clicks the `Automatic highlighting` button
  Then all non blacklisted iframes are bordered
  AND this works after closing and reopening the extension
  Note. If an URL is removed from the blacklisted list while bordered, to border it again you can use the recheck button or reload the web page.
  Note. If an URL is blacklisted while bordered, to stop bordering, the recheck button does not work, the web page must be reloaded.

Scenario: The scroll-applied borders by the `Automatic highlight` button are preserved when opening the popup
  Given the user visits a web page that contains iframes and are bordered by the `Automatic highlight` button
  When the user closes and reopens the extension popup (clicks the add-on icon)
  Then the scroll-applied borders are still visible on the iframe


Feature: `Show logs in the console` button works as expected

Scenario: The `Show logs in the console` shows logs in the browser window if the button is on
  Given the user visits a web page
  When the user clicks the `Show logs in the console` button to set it on and opens the console logs
  Then the logs are shown

Scenario: The `Show logs in the console` does not show logs in the browser window if the button is off
  Given the user visits a web page
  When the user clicks the `Show logs in the console` button to set it off and opens the console logs
  Then the logs are not shown


Feature: Storage is persisted

Background: Repeat each scenario multiple times, replacing CONFIGURED_OPTION with:

- Sources to omit (exact match)
- Sources to notify when are detected
- Sites where first source opens automatically

Scenario: The CONFIGURED_OPTION are persisted after closing the extension
  Given the user adds some cases to the CONFIGURED_OPTION configuration
  When the user clicks the Add button, closes the extension and opens a new browser tab
  Then the configured CONFIGURED_OPTION appears in the configuration section

Scenario: The storage persists the data correctly categorized
  Given the user adds some cases to the sources to omit and sites that redirect configuration
  When the user closes the extension and opens a new browser tab
  Then the configured sources to omit and sites that redirect appear in the configuration section correctly, without being mixed with other configuration types, and the configured sources to notify remain empty

Scenario: The CONFIGURED_OPTION are updated after closing the extension
  Given the user modifies any case of the CONFIGURED_OPTION configuration using the `Add` button and/or pressing the `Enter` key on the keyboard
  When the user confirms the change (clicks the update button), closes the extension and opens a new browser tab
  Then the configured CONFIGURED_OPTION appears with the new values

Scenario: The CONFIGURED_OPTION are not updated after closing the extension
  Given the user modifies any case of the CONFIGURED_OPTION configuration
  When the user cancels the change (clicks the cancel button), closes the extension and opens a new browser tab
  Then the configured CONFIGURED_OPTION appears with the original values

Scenario: The `Clear all` button deletes only the specific configured type
  Given the user adds some cases to all of the possible cases in the CONFIGURED_OPTION variable
  When the user selects one of the cases to configure, clicks the `Clear all` button, closes the extension and opens a new browser tab
  Then only the specified CONFIGURED_OPTION has lost its values

Scenario: The trash button deletes a configured value
  Given the user adds some cases to CONFIGURED_OPTION
  When the user clicks the trash button and opens a new browser tab
  Then the selected value of the CONFIGURED_OPTION has been deleted


Feature: `Sources to omit (exact match)` works as expected

Scenario: Configure sources to omit detects configured sites
  Given the user visits a web page that contains iframes
  When some sources are configured as blacklisted
  Then the URLs don't appear in the show info box and the extension does not scroll to them

Scenario: If all iframes are blacklisted the extension icon shows detections
  Given the user visits a web page that contains iframes
  When all sources are configured as blacklisted
  Then the extension icon color and title show that there are detections, but the `Show tags info` box shows that all are blacklisted


Feature: `Sources to notify when are detected` works as expected

Scenario: Configure sources to notify detects configured sites
  Given the user visits a web page that contains iframes
  When some sources are configured to be notified
  Then the extension changes the icon and title. This is done despite the URL is blacklisted.


Feature: `Sites where first source opens automatically` works as expected

  Scenario: Redirection is done
    Given a web page whose domain is configured in the `Sites where first source opens automatically` option
    When the user visits the web page
    Then the extension performs the automatic redirection

  Scenario: Redirection to the same domain does not cause infinite redirections
    Given a web page where the first iframe source is on the same domain, and that iframe source contains another iframe source also on the same domain (you can see how to simulate this in the [redirection-loop](redirection-loop/README.md) folder). The domain is configured in the `Sites where first source opens automatically` option
    When the user visits the web page
    Then the extension does not perform automatic redirection

Feature logs in Develop Tools are activated or deactivated

Scenario: no logs are shown
  Given the developer tools > console tab is open and the debug variable in src/logger.js is configured as false
  When the extension icon is clicked
  Then the developer tools does not show logs

Scenario: logs are shown
  Given the developer tools > console tab is open and the debug variable in src/logger.js is configured as true
  When the extension icon is clicked
  Then the developer tools shows logs
