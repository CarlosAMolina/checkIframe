// https://stackoverflow.com/questions/41098009/mocking-document-in-jest

import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

export function fakeBrowser(config) {
  const sendMessageResponse =
    config && "sendMessageResponse" in config
      ? config.sendMessageResponse
      : { data: "done sendMessage" };
  const storageItems =
    config && "storageItems" in config ? config.storageItems : {};
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    action: {
      getTitle: getNewPromise,
      setIcon: jest.fn(),
      setTitle: jest.fn(),
    },
    runtime: {
      onMessage: {
        addListener: jest.fn(),
      },
      sendMessage: jest.fn(() => Promise.resolve({})),
    },
    storage: {
      local: {
        get: jest.fn((keysOrDefaults) => {
          if (keysOrDefaults === null || keysOrDefaults === undefined) {
            return Promise.resolve(storageItems);
          }
          if (Array.isArray(keysOrDefaults)) {
            return Promise.resolve(storageItems);
          }
          if (typeof keysOrDefaults === "object") {
            return Promise.resolve({ ...keysOrDefaults, ...storageItems });
          }
          return Promise.resolve(storageItems);
        }),
        remove: jest.fn((key) => removeItem(key, storageItems)),
        set: jest.fn((items) => {
          Object.assign(storageItems, items);
          return Promise.resolve({});
        }),
      },
      session: createStorageMock(),
    },
    tabs: {
      executeScript: getNewPromise,
      // https://stackoverflow.com/questions/56285530/how-to-create-jest-mock-function-with-promise
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      onRemoved: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      query: jest.fn(() =>
        Promise.resolve([{ id: 1, url: "https://example.com" }]),
      ),
      get: jest.fn(() =>
        Promise.resolve({ id: 1, url: "https://example.com" }),
      ),
      sendMessage: jest.fn(() => Promise.resolve(sendMessageResponse)),
      update: jest.fn(() => Promise.resolve({})),
    },
    windows: {
      onFocusChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
}

export function mockNotEmptySourcesContainer(sourcesContainer) {
  const entryElement = document.createElement("p");
  entryElement.textContent = "foo";
  const entryElement2 = document.createElement("p");
  entryElement2.textContent = "bar";
  sourcesContainer.appendChild(entryElement);
  sourcesContainer.appendChild(entryElement2);
}

export function runFakeDom(htmlPathName) {
  const __dirname = path.resolve();
  const htmlPath = path.resolve(__dirname, htmlPathName);
  const html = fs.readFileSync(htmlPath, "utf8");
  const dom = new JSDOM(html);
  global.document = dom.window.document;
  global.window = dom.window;
}

export function runNoHtmlFakeDom() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.window = dom.window;
}

export function initializeDomAndBrowser() {
  runFakeDom("src/popup/popup.html");
  global.browser = fakeBrowser();
}

export function fakeInfoContainer(urlsCount) {
  const containerFake = document.createElement("div");
  for (let i = 0; i < urlsCount; i++) {
    containerFake.appendChild(document.createElement("div"));
  }
  return containerFake;
}

export function mockNotEmptyInfoContainer() {
  const infoContainer = document.createElement("div");
  const entryValue = document.createElement("p");
  entryValue.textContent = "foo";
  infoContainer.appendChild(entryValue);
  return infoContainer;
}

function getNewPromise() {
  return new Promise(function (resolve) {
    resolve("Start of new Promise");
  });
}

function removeItem(key, storageItems) {
  return new Promise((resolve) => {
    delete storageItems[key];
    resolve(storageItems);
  });
}

function createStorageMock() {
  const items = {};
  return {
    get: jest.fn((keysOrDefaults) => {
      if (
        typeof keysOrDefaults === "object" &&
        !Array.isArray(keysOrDefaults)
      ) {
        return Promise.resolve({ ...keysOrDefaults, ...items });
      }
      return Promise.resolve(items);
    }),
    remove: jest.fn((key) => removeItem(key, items)),
    set: jest.fn((newItems) => {
      Object.assign(items, newItems);
      return Promise.resolve({});
    }),
  };
}
