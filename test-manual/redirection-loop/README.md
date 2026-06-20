## Introduction

This folder helps to ensure that no infinite redirection loop occurs when redirecting to the same configured URL.

## Steps

Configure the add-on option `Sites where first source opens automatically` with this value:

```
loop.html
```

Serve the html:

```
python3 -m http.server 8000 --directory test-manual/redirection-loop/
```

Open the html:

```
firefox http://127.0.0.1:8000/loop.html
```

You can see the redirection logs:

```
firefox about:debugging#/runtime/this-firefox
# Select `Inspect` the addon and see the logs in the `Console` tab.
```
