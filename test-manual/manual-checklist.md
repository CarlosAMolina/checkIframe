Feature: Automatic iframe detection

Scenario: Automatic detection in a new page
  Given the user visits a web page that contains iframes
  When the page is loaded
  Then the add-on icon changes to the detection state automatically

Scenario: Automatic detection in a new tab when duplicating
  Given the user is viewing a web page that contains iframes
  When the user duplicates the tab (the browser will change to that new tab)
  Then the add-on icon changes to the detection state automatically

Scenario: Automatic detection in different tabs and windows
  Given there are multiple tabs and windows, some of them with iframes are other not, and some of them are configured to be notified
  When the user changes to tabs and windows
  Then the add-on icon changes to the detection state automatically (correct state: to notify, detected or not detected)

Feature: Recheck button

Scenario: Recheck button rechecks the page
  Given the user visits a web page
  When the user opens the add-on and clicks the button Recheck
  Then the logs show that the add-on rechecks the page

Scenario: Recheck button reloads results
  Given the user visits a web page with iframes and opens the add-on `Show tags info` box.
  When the user adds one iframe to the `Sources to omit` configuration and clicks the recheck button
  Then the text int the `Show tags info` box is updated showing that an iframe is blacklisted.

Feature: `Scroll to element` button

Scenario: The button scrolls to the iframes
  Given the user visits a web page that contains iframes
  When the user clicks the `Scroll to element` button
  Then the add-on scrolls to each element. Do it twice to check that the detections are looped from the beginning after the last element is reached
  AND the index of the showed URL matches the index of the URL in the `Show tags info box`

Scenario: The button does not scroll to the iframes if all balcklisted
  Given the user visits a web page that contains iframes but are all configured as blacklisted
  When the user clicks the `Scroll to element` button
  Then the add-on does not scroll to each element

Feature: `Clean border` button

Scenario: The button drops the border
  Given an iframe is bordered
  When the user clicks the `Clean border` button
  Then the border is dropped

Feature: `Show tags info` button

Scenario: The button show expected info if no balcklisted urls
  Given the user visits a web page that contains iframes
  When the user clicks the `Show tags info` button
  Then the add-on shows the information of all the iframes

Scenario: The button show expected info if balcklisted urls
  Given the user visits a web page that contains iframes and some of them are blacklisted
  When the user clicks the `Show tags info` button
  Then the add-on shows the information of the non-blacklisted iframes

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
  When the user closes the add-on and opens a new tab of the browser
  Then clicked CONFIGURED_OPTION is off

Scenario: The on/off buttons are stored as off
  Given the user clicks the on/off button CONFIGURED_OPTION that is currently on
  When the user closes the add-on and opens a new tab of the browser
  Then clicked CONFIGURED_OPTION is off

Feature: `Always show tags info` works as expected

Scenario: The `Always show tags info` modifies the popup correctly
  Given the add-on is open
  When the user clicks the `Always show tags info`  button
  Then the `Show tags info` button disappears and its content is shown
  AND this works after close and open again the add-on


Feature: `Automatic highlighting` works as expected 

Scenario: The `Automatic highlighting` modifies the popup correctly
  Given the add-on is open
  When the user clicks the `Automatic highlighting`  button
  Then the `Scroll to element`  and `Clean border` disappears
  AND this works after close and open again the add-on

Scenario: The `Automatic highlighting` highlights all iframes
  Given the user visits a web page that contains iframes
  When the user clicks the `Automatic highlighting`  button
  Then all iframes are bordered
  AND this works after close and open again the add-on

Feature: `Show logs in the console` works as expected

Scenario: The `Show logs in the console` shows logs in browser window if the button is on
  Given the user visits a web page
  When the user clicks the `Show logs in the console` button to set if on and open the console logs
  Then the logs are shown

Scenario: The `Show logs in the console` does not show logs in browser window if the button is off
  Given the user visits a web page
  When the user clicks the `Show logs in the console` button to set it off and open the console logs
  Then the logs are not shown

Feature: Storage is persisted

Background: Repeat each scenario multiple times, replacing CONFIGURED_OPTION with: 

- Sources to omit (exact match)
- Sources to notify when are detected
- Sites where first source opens automatically

Scenario: The CONFIGURED_OPTION are persisted after closing the add-on
  Given the user adds some cases to the CONFIGURED_OPTION configuration
  When the user clicks the Add button, closes the add-on and opens a new tab of the browser
  Then the configured CONFIGURED_OPTION appear in the configuration section

Scenario: The storage persists the data correctly categorized
  Given the user adds some cases to the sources to omit and sites that redirect configuration
  When the user closes the add-on and opens a new tab of the browser
  Then the configured sources to omit and sites that redirect appear in the configuration section correctly, without being mixed with other configuration types. And the configured sources to notify are empty

Scenario: The CONFIGURED_OPTION are updated after closing the add-on
  Given the user modifies any case of the CONFIGURED_OPTION configuration
  When the user confirms the change (clicks the update button), closes the add-on and opens a new tab of the browser
  Then the configured CONFIGURED_OPTION appear with the new values

Scenario: The CONFIGURED_OPTION are not updated after closing the add-on
  Given the user modifies any case of the CONFIGURED_OPTION configuration
  When the user cancels the change (clicks the cancel button) and closes the add-on and opens a new tab of the browser
  Then the configured CONFIGURED_OPTION appear with the new values

Scenario: The `Clear all` button deletes only the specific configured type
  Given the user adds some cases to every of the possible cases in the CONFIGURED_OPTION variable
  When the user selects to configure one of the cases, clicks the `Clear all` button, closes the add-on and opens a new tab of the browser
  Then only the specified CONFIGURED_OPTION has lost it values

Scenario: The trash button deletes a configured value
  Given the user adds some cases to CONFIGURED_OPTION 
  When the user clicks the trash button and opens a new tab of the browser
  Then selected value of the CONFIGURED_OPTION has been deleted

Feature: `Sources to omit (exact match)` works as expected

Scenario: Configure sources to omit detects configured sites
  Given the user visits a web page that contains iframes
  When some sources are configured as blacklisted
  Then the add-on does not scrolls to them

Scenario: If all iframes are blacklisted the addon shows detections
  Given the user visits a web page that contains iframes
  When all sources are configured as blacklisted
  Then the add-on icon color and title show that there are detections but the `Show tags info` box shows that all are blacklisted

Feature: `Sources to notify when are detected` works as expected

Scenario: Configure sources to notify detects configured sites
  Given the user visits a web page that contains iframes
  When some sources are configured to be notified
  Then the add-on changes the icon and title

Feature: `Sites where first source opens automatically` works as expected

  Background: The user is on a web page configured in the add-on to run automatic redirects. You have an example in the [redirection-loop](redirection-loop/) folder.
  Scenario: Redirection to the same domain does not cause infinite redirections
    Given a web page where the first iframe source is on the same domain, and that iframe source contains another iframe source also on the same domain. The domain is configured in the `Sites where first source opens automatically` option
    When the user visits the web page
    Then the add-on performs the automatic redirection only once, and the second redirection is not performed
