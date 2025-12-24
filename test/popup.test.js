import { runMockDom } from "./mockDom.js";
import { HtmlBuilder } from "./builder.js";

function mockBrowser(storageItems = null) {
  if (storageItems === null) {
    storageItems = {};
  }
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    storage: {
      local: {
        get: jest.fn(() => Promise.resolve(storageItems)),
        remove: jest.fn(() => Promise.resolve({})),
        set: jest.fn(() => Promise.resolve({})),
      },
    },
    tabs: {
      executeScript: getNewPromise,
      // https://stackoverflow.com/questions/56285530/how-to-create-jest-mock-function-with-promise
      query: jest.fn(() => Promise.resolve([{ id: 1 }])),
      sendMessage: jest.fn(() => Promise.resolve({ data: "done sendMessage" })),
    },
  };
}

function getNewPromise(args) {
  return new Promise(function (resolve, reject) {
    resolve("Start of new Promise");
  });
}

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let popupModule;
let button;
let function_;
const buttonIdsHtml = [
  "buttonRecheck",
  "buttonClean",
  "buttonScroll",
  "buttonShowSources",
  "buttonShowConfig",
  "buttonUrlsNotify",
  "buttonUrlsBlacklist",
  "buttonUrlsReferer",
  "buttonAddUrl",
  "buttonClearAll",
];
const tabId = 1;

describe("Check module import", () => {
  beforeEach(() => {
    initializeMocks();
  });
  it("The DOM has expected values", function () {
    expect(document.getElementById("pInput").textContent).toBe("New values");
  });
  it("The module should be imported without errors and has expected values", function () {
    expect(popupModule.__get__("URL_TYPE_BLACKLIST")).toEqual("blacklist");
  });
  it("url has expected attributes", function () {
    const UrlsOfType = popupModule.__get__("UrlsOfType");
    const type = "notify";
    const values = ["url_1", "url_2"];
    const urls_of_type = new UrlsOfType(type, values);
    expect(urls_of_type.type).toEqual("notify");
    expect(urls_of_type.values).toEqual(["url_1", "url_2"]);
  });
  it("popupMain runs without error", function () {
    function_ = popupModule.__get__("popupMain");
    function_();
  });
  it("initializePopup runs without error", function () {
    function_ = popupModule.__get__("initializePopup");
    function_();
  });
  it("getIdHtmlOfClickedButtonOrImageFromEventClick runs without error", function () {
    function_ = popupModule.__get__(
      "getIdHtmlOfClickedButtonOrImageFromEventClick",
    );
    const eventClick = { target: { id: 1 } };
    function_(eventClick);
  });
  it("getStoredUrls returns expected result", function () {
    const storageItems = {
      blacklist_url1: "url1",
      blacklist_url2: "url2",
      notify_url3: "url3",
      referer_url4: "url4",
    };
    const UrlsOfType = popupModule.__get__("UrlsOfType");
    const expectedResult = [
      new UrlsOfType("blacklist", ["url1", "url2"]),
      new UrlsOfType("notify", ["url3"]),
      new UrlsOfType("referer", ["url4"]),
    ];
    function_ = popupModule.__get__("getStoredUrls");
    const result = function_(storageItems);
    expect(result).toEqual(expectedResult);
  });
  describe("Check buttons", () => {
    beforeAll(() => {
      initializeMocks();
    });
    describe("Check createButton", () => {
      beforeAll(() => {
        function_ = popupModule.__get__("createButton");
      });
      // Parametrized test.
      it.each(buttonIdsHtml)("Check if valid button ID: %p", (buttonIdHtml) => {
        const result = function_(buttonIdHtml)._idHtml;
        expect(result).toBe(buttonIdHtml);
      });
      it("Check if invalid button ID", function () {
        const buttonIdHtml = "nonexistent";
        const result = function_(buttonIdHtml);
        expect(result).toBe(false);
      });
    });
    describe("Check buttons click without error", () => {
      it.each(buttonIdsHtml)("Check button ID %p ", (buttonIdHtml) => {
        console.log = jest.fn(); // Avoid lot of logs on the screen.
        console.error = jest.fn(); // Avoid lot of logs on the screen.
        const createButton = popupModule.__get__("createButton");
        const button = createButton(buttonIdHtml);
        button.click();
      });
    });
    describe("Check Button", () => {
      beforeAll(() => {
        const ButtonBase = popupModule.__get__("Button");
        class TestButton extends ButtonBase {
          get _idHtml() {
            return "idTest";
          }
        }
        button = new TestButton();
      });
      it("Check buttonIdHtml returns expected result", function () {
        const result = button._idHtml;
        expect(result).toBe("idTest");
      });
      it("Check click throws error", function () {
        try {
          button.click();
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe("Not implemented: method click");
        }
      });
      it("Check logButtonName logs expected message", function () {
        console.log = jest.fn();
        button.logButtonName();
        expect(console.log).toHaveBeenCalledWith(
          "Clicked button ID Html: idTest",
        );
      });
    });
    describe("Check ButtonRecheck", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonRecheck");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonRecheck");
      });
      it("Check click has expected calls and values", async () => {
        document.querySelector("#infoTags").classList.remove("hidden");
        expect(document.getElementById("infoTags").className).toBe(
          "section backgroundGray sources-container",
        );
        await button.click();
        const buttonIdHtml = "buttonRecheck";
        expect(document.getElementById("infoTags").className).toBe(
          "section backgroundGray sources-container hidden",
        );
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall[0]).toBe(tabId);
        expect(lastCall[1].info).toBe(buttonIdHtml);
        // TODO check and control lastCall[1].values (is affected by other tests that create a big array of aleatory size).
      });
    });
    describe("Check ButtonClean", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonClean");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonClean");
      });
      it("Check click has expected calls and values", async () => {
        document.querySelector("#infoScroll").classList.remove("hidden");
        expect(document.getElementById("infoScroll").className).toBe(
          "section backgroundGray",
        );
        await button.click();
        const buttonIdHtml = "buttonClean";
        expect(document.getElementById("infoScroll").className).toBe(
          "section backgroundGray hidden",
        );
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall[0]).toBe(tabId);
        expect(lastCall[1].info).toBe(buttonIdHtml);
        // TODO check and control lastCall[1].values (is affected by other tests that create a big array of aleatory size).
      });
    });
    describe("Check ButtonScroll", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonScroll");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonScroll");
      });
      describe("Check button click", () => {
        describe("Check if all required data exists", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() =>
              Promise.resolve({ response: "done sendMessage" }),
            );
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.click()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "done sendMessage",
            );
          });
        });
        describe("Check if undefined response.response", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.click()]);
            runAfterRunExpects();
            expect(document.getElementById("infoScroll").textContent).toBe(
              "Internal error. The action could not be executed",
            );
          });
        });
        function runBeforeRunExpects() {
          const infoScrollBeforeRun = document.getElementById("infoScroll");
          expect(infoScrollBeforeRun.className).toBe(
            "section backgroundGray hidden",
          );
          expect(infoScrollBeforeRun.textContent).toBe("");
        }
        function runAfterRunExpects() {
          expect(document.getElementById("infoScroll").className).toBe(
            "section backgroundGray",
          );
          expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
          const lastCall = browser.tabs.sendMessage.mock.lastCall;
          expect(lastCall).toEqual([tabId, { info: "buttonScroll" }]);
        }
      });
    });
    describe("Check ButtonShowSources", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonShowSources");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonShowSources");
      });
      describe("Check button click", () => {
        describe("Check if all required data exists", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() =>
              Promise.resolve({
                response: {
                  frame: {
                    sourcesAllNumber: 2,
                    sourcesValid: ["https://frame1.com", "about:blank"],
                  },
                  iframe: { sourcesAllNumber: 0, sourcesValid: [] },
                },
              }),
            );
            mockNotEmptySourcesContainer();
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            expect(
              popupModule.__get__("sourcesContainer").firstChild.textContent,
            ).toBe("foo");
            await Promise.all([button.click()]);
            runAfterRunExpects();
            const result = popupModule.__get__("sourcesContainer").innerHTML;
            const expectedResult = new HtmlBuilder()
              .with_total(2)
              .with_element("Frame")
              .with_number("frames", 2)
              .with_not_blacklisted("frames", 2)
              .with_urls(["https://frame1.com", "about:blank"])
              .with_element("IFrame")
              .with_number("iframes", 0)
              .build()
              .replace(/svg" \//g, 'svg"');
            expect(result).toBe(expectedResult);
          });
        });
        describe("Check if undefined response.response", () => {
          beforeEach(() => {
            browser.tabs.sendMessage = jest.fn(() => Promise.resolve({}));
          });
          it("Check expected calls and values", async () => {
            runBeforeRunExpects();
            await Promise.all([button.click()]);
            runAfterRunExpects();
            expect(document.getElementById("infoTags").textContent).toBe(
              "Internal error. The action could not be executed",
            );
          });
        });
      });
      function runBeforeRunExpects() {
        const infoScrollBeforeRun = document.getElementById("infoTags");
        expect(infoScrollBeforeRun.className).toBe(
          "section backgroundGray sources-container hidden",
        );
        expect(infoScrollBeforeRun.textContent).toBe("");
      }
      function runAfterRunExpects() {
        expect(document.getElementById("infoTags").className).toBe(
          "section backgroundGray sources-container",
        );
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        const lastCall = browser.tabs.sendMessage.mock.lastCall;
        expect(lastCall).toEqual([tabId, { info: "buttonShowSources" }]);
      }
    });
    describe("Check ButtonShowConfig", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonShowConfig");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonShowConfig");
      });
      it("Check click has expected calls and values", function () {
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGray hidden",
        );
        button.click();
        expect(document.getElementById("menuConfig").className).toBe(
          "section backgroundGray",
        );
      });
    });
    describe("Check ButtonUrlsNotify", () => {
      beforeAll(() => {
        const classType = popupModule.__get__("ButtonUrlsNotify");
        button = new classType();
      });
      it("Check it has correct button ID value", function () {
        expect(button._idHtml).toBe("buttonUrlsNotify");
      });
      describe("Check click has expected calls and values", () => {
        describe("Test removeShownStoredUrls call", () => {
          beforeEach(() => {
            mockNotEmptyInfoContainer();
          });
          it("Test", async () => {
            expect(
              popupModule.__get__("infoContainer").firstChild.textContent,
            ).toBe("foo");
            button.click();
            expect(popupModule.__get__("infoContainer").firstChild).toBe(null);
          });
        });
        // TODO describe("Test showStoredUrlsType call", () => {
        // TODO     console.info("*** start"); // TODO rm
        // TODO     console.info("*** end"); // TODO rm
        // TODO });
      });
    });
  });
  it("clearStorageInfo removes matching storage keys, updates urls, and cleans DOM", async () => {
    const storageItems = {
      blacklist_url1: "url1",
      blacklist_url2: "url2",
      notify_url3: "url3", // Should not be removed
    };
    global.browser = mockBrowser(storageItems);
    const containerFake = document.createElement("div");
    containerFake.appendChild(document.createElement("div")); // First blacklisted url.
    containerFake.appendChild(document.createElement("div")); // Second blacklisted url.
    popupModule.__set__("infoContainer", containerFake);
    const UrlsOfType = popupModule.__get__("UrlsOfType");
    setUrls = popupModule.__get__("setUrls");
    setUrls([
      new UrlsOfType("blacklist", ["url1", "url2"]),
      new UrlsOfType("notify", ["url3"]),
    ]);
    const sendInfoAndValueBackup = popupModule.__get__("sendInfoAndValue");
    popupModule.__set__("sendInfoAndValue", jest.fn());
    function_ = popupModule.__get__("clearStorageInfo");
    await function_("blacklist");
    // Check storage.remove.
    expect(browser.storage.local.remove).toHaveBeenCalledWith("blacklist_url1");
    expect(browser.storage.local.remove).toHaveBeenCalledWith("blacklist_url2");
    expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
      "notify_url3",
    );
    // Assert infoContainer children were removed.
    const container = popupModule.__get__("infoContainer");
    expect(container.children.length).toBe(0);
    // Assert urls were updated.
    getUrls = popupModule.__get__("getUrls");
    const expectedUrls = [
      new UrlsOfType("blacklist", []),
      new UrlsOfType("notify", ["url3"]),
    ];
    expect(getUrls()).toEqual(expectedUrls);
    // Assert sendInfoAndValue was called with updated urls
    const sendInfoAndValue = popupModule.__get__("sendInfoAndValue");
    expect(sendInfoAndValue).toHaveBeenCalledWith("urls", expectedUrls);
    global.browser = mockBrowser();
    popupModule.__set__("sendInfoAndValue", sendInfoAndValueBackup);
  });
  describe("Check function showStoredInfo", () => {
    describe("DOM elements are created correctly", () => {
      beforeEach(() => {
        mockEmptyInfoContainer();
      });
      it("If no values to manage", function () {
        expect(popupModule.__get__("infoContainer").innerHTML).toBe("");
        function_ = popupModule.__get__("showStoredInfo");
        function_();
        expect(popupModule.__get__("infoContainer").innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p></p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
      it("If values to manage", function () {
        expect(popupModule.__get__("infoContainer").innerHTML).toBe("");
        function_ = popupModule.__get__("showStoredInfo");
        const eKey = "blacklist_https://foo.com/test.html";
        const eValue = "https://foo.com/test.html";
        function_(eKey, eValue);
        expect(popupModule.__get__("infoContainer").innerHTML).toBe(
          '<div><div class="section sourceConfig"><button title="Delete"><img src="/icons/trash.svg" alt="Delete"></button><p>https://foo.com/test.html</p></div><div class="section sourceConfig" style="display: none;"><input><button title="Update"><img src="/icons/ok.svg" alt="Update"></button><button title="Cancel update"><img src="/icons/cancel.svg" alt="Cancel update"></button></div></div>',
        );
      });
    });
    describe("Buttons click works correctly", () => {
      beforeEach(() => {
        const UrlsOfType = popupModule.__get__("UrlsOfType");
        setUrls = popupModule.__get__("setUrls");
        setUrls([
          new UrlsOfType("blacklist", []),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        browser.tabs.sendMessage = jest.fn(() =>
          Promise.resolve({ data: "done sendMessage" }),
        );
        mockEmptyInfoContainer();
      });
      it("Test click deleteBtn", async () => {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        // TODO in some part of the code the urls.blacklist must have de eKey or eValue value. Add this behaviour to the tests.
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const buttons = infoContainer.getElementsByTagName("button");
        expect(buttons.length).toBe(3);
        expect(buttons[0].title).toBe("Delete");
        expect(buttons[1].title).toBe("Update");
        expect(buttons[2].title).toBe("Cancel update");
        const deleteButton = buttons[0];
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        const UrlsOfType = popupModule.__get__("UrlsOfType");

        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toEqual([
          new UrlsOfType("blacklist", []),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(0);
        await deleteButton.click();
        const buttonsAfterClick = infoContainer.getElementsByTagName("button");
        // Test elements have been deleted.
        expect(buttonsAfterClick.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(1);
        expect(browser.storage.local.remove.mock.lastCall).toEqual([eKey]);
        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toEqual([
          new UrlsOfType("blacklist", []),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        expect(browser.tabs.sendMessage.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new UrlsOfType("blacklist", []),
              new UrlsOfType("notify", []),
              new UrlsOfType("referer", []),
            ],
          },
        ]);
      });
      it("Test click entryValue", function () {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("p").length,
        ).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const pElements = infoContainer.getElementsByTagName("p");
        const entryValue = pElements[0];
        expect(entryValue.textContent).toBe("https://foo.com/test.html");
        const indexDivElementToCheck = 1;
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        entryValue.click();
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe("display: none;");
      });
      it("Test click cancelBtn", function () {
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("button")
            .length,
        ).toBe(0);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        const infoContainer = popupModule.__get__("infoContainer");
        const cancelButton = infoContainer.getElementsByTagName("button")[2];
        expect(cancelButton.title).toBe("Cancel update");
        const indexDivElementToCheck = 1;
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
        cancelButton.click();
        expect(
          popupModule
            .__get__("infoContainer")
            .getElementsByTagName("div")
            [indexDivElementToCheck].getAttribute("style"),
        ).toBe(null);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
      });
      it("Test click updateBtn", async () => {
        document.getElementById("buttonUrlsBlacklist").checked = true;
        const eValue = "https://foo.com/test.html";
        const eKey = "blacklist_https://foo.com/test.html";
        const UrlsOfType = popupModule.__get__("UrlsOfType");
        getUrls = popupModule.__get__("getUrls");
        expect(getUrls()).toStrictEqual([
          new UrlsOfType("blacklist", []),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        setUrls = popupModule.__get__("setUrls");
        setUrls([
          new UrlsOfType("blacklist", [eValue]),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        expect(getUrls()).toStrictEqual([
          new UrlsOfType("blacklist", ["https://foo.com/test.html"]),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        function_ = popupModule.__get__("showStoredInfo");
        function_(eKey, eValue);
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe("https://foo.com/test.html");
        const infoContainer = popupModule.__get__("infoContainer");
        const updateButton = infoContainer.getElementsByTagName("button")[1];
        expect(updateButton.title).toBe("Update");
        const entryEditInputValue = "https://new-url.com/test-2.html";
        popupModule
          .__get__("infoContainer")
          .getElementsByTagName("input")[0].value = entryEditInputValue;
        expect(
          popupModule.__get__("infoContainer").getElementsByTagName("input")[0]
            .value,
        ).toBe(entryEditInputValue);
        expect(getUrls()).toStrictEqual([
          new UrlsOfType("blacklist", ["https://foo.com/test.html"]),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        expect(browser.storage.local.get.mock.calls.length).toBe(0);
        expect(browser.storage.local.set.mock.calls.length).toBe(0);
        expect(browser.storage.local.remove.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        expect(browser.tabs.query.mock.calls.length).toBe(0);
        await Promise.all([updateButton.click()]);
        expect(browser.storage.local.get.mock.calls.length).toBe(1);
        const expectedId2save = "blacklist_https://new-url.com/test-2.html";
        expect(browser.storage.local.get.mock.lastCall).toEqual([
          expectedId2save,
        ]);
        // Test updateEntry
        // Test addUrl
        expect(getUrls()).toStrictEqual([
          new UrlsOfType("blacklist", ["https://new-url.com/test-2.html"]),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ]);
        expect(browser.storage.local.set.mock.calls.length).toBe(1);
        const expectedInfo2save = "https://new-url.com/test-2.html";
        expect(browser.storage.local.set.mock.lastCall).toStrictEqual([
          { "blacklist_https://new-url.com/test-2.html": expectedInfo2save },
        ]);
        expect(browser.storage.local.remove.mock.calls.length).toBe(1);
        expect(browser.storage.local.remove.mock.lastCall).toStrictEqual([
          "blacklist_https://foo.com/test.html",
        ]);
        // TODO not tested (is executed after the test ends): removingEntry.then(() => { showStoredInfo
        // Test sendInfoAndValue
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.query.mock.calls.length).toBe(1);
        expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
          tabId,
          {
            info: "urls",
            values: [
              new UrlsOfType("blacklist", ["https://new-url.com/test-2.html"]),
              new UrlsOfType("notify", []),
              new UrlsOfType("referer", []),
            ],
          },
        ]);
        document.getElementById("buttonUrlsBlacklist").checked = false;
        // TODO not tested entry.parentNode.removeChild(entry);
      });
    });
  });
  it("hide adds class", function () {
    function_ = popupModule.__get__("hide");
    const htmlId = "buttonRecheck";
    expect(document.getElementById(htmlId).className).toBe("");
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe("hidden");
  });
  it("unhide removes class", function () {
    function_ = popupModule.__get__("unhide");
    const htmlId = "infoScroll";
    expect(document.getElementById(htmlId).className).toBe(
      "section backgroundGray hidden",
    );
    function_(htmlId);
    expect(document.getElementById(htmlId).className).toBe(
      "section backgroundGray",
    );
  });
  it("sendInfo has expected calls and values", async () => {
    const UrlsOfType = popupModule.__get__("UrlsOfType");
    // The first time the popup is initialized I think it has these values.
    function_ = popupModule.__get__("sendInfo");
    const tabs = [{ id: 1234 }];
    let info2sendFromPopup = "urls";
    const values2sendFromPopup = [
      new UrlsOfType("blacklist", []),
      new UrlsOfType("notify", []),
      new UrlsOfType("referer", []),
    ];
    await function_(tabs, info2sendFromPopup, values2sendFromPopup);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      1234,
      {
        info: "urls",
        values: [
          new UrlsOfType("blacklist", []),
          new UrlsOfType("notify", []),
          new UrlsOfType("referer", []),
        ],
      },
    ]);
    expect(browser.tabs.sendMessage.mock.results[0].value).resolves.toEqual({
      data: "done sendMessage",
    });
  });
  it("showOrHideInfo runs without error", function () {
    function_ = popupModule.__get__("showOrHideInfo");
    const htmlId = "infoScroll";
    function_(htmlId);
  });
  it("showStoredUrlsType runs without error", function () {
    function_ = popupModule.__get__("showStoredUrlsType");
    function_();
  });
  it("sendInfoAndValue has expected calls and values", async () => {
    const info2send = "info 2 send";
    const value2send = "value 2 send";
    function_ = popupModule.__get__("sendInfoAndValue");
    await function_(info2send, value2send);
    expect(browser.tabs.sendMessage.mock.lastCall).toStrictEqual([
      tabId,
      {
        info: "info 2 send",
        values: "value 2 send",
      },
    ]);
  });
  it("sendInfoSaveAndShowAnswer runs without error", function () {
    console.error = jest.fn();
    function_ = popupModule.__get__("sendInfoSaveAndShowAnswer");
    const tabs = [{ id: "a" }];
    function_(tabs, "foo", "foo");
  });
  it("changeParagraph runs without error", function () {
    const frameTagsSummary = {
      sourcesAllNumber: 2,
      sourcesValid: ["https://frame1.com", "about:blank"],
    };
    const iframeTagsSummary = {
      sourcesAllNumber: 0,
      sourcesValid: [],
    };
    const response = { frame: frameTagsSummary, iframe: iframeTagsSummary };
    const htmlId = "infoTags";
    function_ = popupModule.__get__("changeParagraph");
    function_("buttonShowSources", response, htmlId);
  });
  describe("Check cleanShowSources", () => {
    beforeEach(() => {
      mockNotEmptySourcesContainer();
    });
    it("Elements are modified", function () {
      expect(
        popupModule.__get__("sourcesContainer").firstChild.textContent,
      ).toBe("foo");
      function_ = popupModule.__get__("cleanShowSources");
      function_();
      expect(popupModule.__get__("sourcesContainer").firstChild).toBe(null);
    });
  });
  describe("Check removeShownStoredUrls", () => {
    beforeEach(() => {
      mockNotEmptyInfoContainer();
    });
    it("Elements are modified", function () {
      expect(popupModule.__get__("infoContainer").firstChild.textContent).toBe(
        "foo",
      );
      function_ = popupModule.__get__("removeShownStoredUrls");
      function_();
      expect(popupModule.__get__("infoContainer").firstChild).toBe(null);
    });
  });
  describe("Check modify urls", () => {
    it("deleteUrl deletes url", () => {
      const UrlsOfType = popupModule.__get__("UrlsOfType");
      const urls = [
        new UrlsOfType("blacklist", [
          "https://foo.com/foo.html",
          "https://foo.com/foo-2.html",
        ]),
        new UrlsOfType("notify", [
          "https://foo.com/foo-3.html",
          "https://foo.com/foo-4.html",
        ]),
        new UrlsOfType("referer", [
          "https://foo.com/foo-5.html",
          "https://foo.com/foo-6.html",
        ]),
      ];
      function_ = popupModule.__get__("deleteUrl");
      const eKey = "blacklist_https://foo.com/foo.html";
      const result = function_(eKey, urls, "blacklist");
      expectedResult = [
        new UrlsOfType("blacklist", ["https://foo.com/foo-2.html"]),
        new UrlsOfType("notify", [
          "https://foo.com/foo-3.html",
          "https://foo.com/foo-4.html",
        ]),
        new UrlsOfType("referer", [
          "https://foo.com/foo-5.html",
          "https://foo.com/foo-6.html",
        ]),
      ];
      expect(result).toEqual(expectedResult);
    });
    it("addUrl adds url", function () {
      const UrlsOfType = popupModule.__get__("UrlsOfType");
      const urls = [
        new UrlsOfType("blacklist", ["https://foo.com/foo.html"]),
        new UrlsOfType("notify", []),
        new UrlsOfType("referer", []),
      ];
      function_ = popupModule.__get__("addUrl");
      const eKey = "blacklist_https://foo.com/foo-2.html";
      const result = function_(eKey, urls, "blacklist");
      expectedResult = [
        new UrlsOfType("blacklist", [
          "https://foo.com/foo.html",
          "https://foo.com/foo-2.html",
        ]),
        new UrlsOfType("notify", []),
        new UrlsOfType("referer", []),
      ];
      expect(result).toEqual(expectedResult);
    });
  });
  it("saveUrl runs without error", function () {
    function_ = popupModule.__get__("saveUrl");
    function_();
  });
  it("storeInfo runs without error", function () {
    function_ = popupModule.__get__("storeInfo");
    function_(["value_1"]);
  });
  it("reportError logs expected message", function () {
    function_ = popupModule.__get__("reportError");
    console.error = jest.fn();
    function_("foo message");
    expect(console.error).toHaveBeenCalledWith("Error: foo message");
  });
  it("reportExecuteScriptError runs without error", function () {
    function_ = popupModule.__get__("reportExecuteScriptError");
    const error = {};
    function_(error);
  });
  function mockNotEmptySourcesContainer() {
    let entryElement = document.createElement("p");
    let extraTextElement = document.createElement("p");
    extraTextElement.textContent = "foo";
    entryElement.appendChild(extraTextElement);
    popupModule.__set__("sourcesContainer", entryElement);
  }
  function mockEmptyInfoContainer() {
    let element = document.createElement("div");
    element.setAttribute("class", "info-container");
    popupModule.__set__("infoContainer", element);
  }
  function mockNotEmptyInfoContainer() {
    let entryElement = document.createElement("div");
    let entryValue = document.createElement("p");
    entryValue.textContent = "foo";
    entryElement.appendChild(entryValue);
    popupModule.__set__("infoContainer", entryElement);
  }
});

describe("setupCopyButtonListeners", () => {
  beforeEach(() => {
    initializeMocks();
  });
  it("Copies url to clipboard and shows temporary feedback", async () => {
    jest.useFakeTimers();
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    const html = new HtmlBuilder().with_urls(["https://foo.com"]).build();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container.firstElementChild);
    const btn = document.querySelector(".detections button");
    const img = btn.querySelector("img");
    const span = btn.querySelector(".tooltiptext");
    const setup = popupModule.__get__("setupCopyButtonListeners");
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

function initializeMocks() {
  const htmlPathName = "src/popup/popup.html";
  runMockDom(htmlPathName);
  global.browser = mockBrowser();
  const popupJsPathName = "../src/popup/popup.js";
  popupModule = require(popupJsPathName);
}
