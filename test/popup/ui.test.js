import * as fakeModule from "../fake.js";
import * as htmlBuilderModule from "../builder.js";

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;

describe("setupSourcesCopyButtonListeners", () => {
  beforeEach(() => {
    initializeMocksAndVariables();
  });
  it("should copy the url to clipboard and show temporary feedback", async () => {
    jest.useFakeTimers();
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    const html = new htmlBuilderModule.HtmlBuilder()
      .with_urls(["https://foo.com"])
      .build();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container.firstElementChild);
    const btn = document.querySelector(".detections button");
    const img = btn.querySelector("img");
    const span = btn.querySelector(".tooltiptext");
    const setup = popupModule.__get__("setupSourcesCopyButtonListeners");
    setup();
    btn.click();
    await Promise.resolve(); // Wait a microtask to let Promise.then() handlers click
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://foo.com/",
    );
    expect(btn.disabled).toBe(true);
    expect(img.src.endsWith("/icons/ok.svg")).toBe(true);
    expect(span.textContent).toBe("Copied");
    jest.runAllTimers(); // Advance timers to restore UI.
    await Promise.resolve(); // Wait so the restoration code (in setTimeout) completes.
    expect(btn.disabled).toBe(false);
    expect(img.src.endsWith("/icons/copy.svg")).toBe(true);
    expect(span.textContent).toBe("Copy to clipboard");
    jest.useRealTimers();
  });
});

function initializeMocksAndVariables() {
  initializeDomAndBrowser();
  popupModule = require("../../src/popup/popup.js");
}

function initializeDomAndBrowser() {
  fakeModule.runFakeDom("src/popup/popup.html");
  global.browser = fakeModule.fakeBrowser();
}
