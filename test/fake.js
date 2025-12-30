// https://stackoverflow.com/questions/41098009/mocking-document-in-jest

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

export function fakeBrowser(storageItems = null) {
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
