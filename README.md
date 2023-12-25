# checkIframe

## Introduction

Firefox add-on to work with iframe and frame tags:

- Indicate if the current web page uses iframe and frame tags by changing the colour of the add-on icon.
- Scroll the window to the elements with tags and highlight them with a red border.
- Redirection. A list of sites where the add-on will apply a redirection automatically to the first iframe/frame source can be configured.

### Add-on notifications

Set the mouse over the icon to see a description of the result. Icon colours: 

- Blue icon: the website cannot be checked.
- Green icon: no tag iframe or frame detected.
- Orange icon: tag detected.
- Purple icon: tag detected and at least one source matches with any term in the configured user’s list of special sources to notify.

## Add-on URL

You can install the Firefox add-on at:

<https://addons.mozilla.org/es/firefox/addon/check-iframe/>

## Documentation

Please, read the docs to know how to configure the add-on, work with it and more information:

<https://cmoli.es/projects/check-iframe/introduction.html>

## Testing

### Initial steps

In the same path as the `package.json` file, install the requirements:

```bash
npm install
```

### Run tests

```bash
npm test
```
