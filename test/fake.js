// https://stackoverflow.com/questions/41098009/mocking-document-in-jest

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

export function fakeBrowser(config) {
  let storageItems = {};
  let sendMessageResponse = { data: "done sendMessage" };
  if (config !== undefined) {
    if ("storageItems" in config) {
      storageItems = config.storageItems;
    }
    if ("sendMessageResponse" in config) {
      sendMessageResponse = config.sendMessageResponse;
    }
  }
  let sendMessageFunction = Promise.resolve(sendMessageResponse);
  // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
  return {
    browserAction: {
      getTitle: getNewPromise,
      setIcon: jest.fn(),
      setTitle: jest.fn(),
    },
    runtime: {
      onMessage: {
        addListener: jest.fn(),
      },
    },
    storage: {
      local: {
        get: jest.fn(() => Promise.resolve(storageItems)),
        remove: jest.fn((key) => removeItem(key, storageItems)),
        set: jest.fn(() => Promise.resolve({})),
      },
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
      query: jest.fn(() => Promise.resolve([{ id: 1 }])),
      sendMessage: jest.fn(() => sendMessageFunction),
      update: getNewPromise,
    },
    windows: {
      onFocusChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
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

function getNewPromise(args) {
  return new Promise(function (resolve, reject) {
    resolve("Start of new Promise");
  });
}

function removeItem(key, storageItems) {
  return new Promise((resolve, reject) => {
    delete storageItems[key];
    resolve(storageItems);
  });
}
