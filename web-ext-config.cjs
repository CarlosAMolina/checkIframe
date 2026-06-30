module.exports = {
    sourceDir: "dist/firefox",
    run: {
        startUrl: [
            "about:debugging#/runtime/this-firefox",
            "https://html.com/tags/iframe/",
            "https://duckduckgo.com/",
            "test-manual/all-types-of-iframes/index.html"
        ],
        devtools: true
    }
}
