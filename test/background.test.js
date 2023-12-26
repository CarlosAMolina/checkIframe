import { runNoHtmlMockDom } from './mockDom.js';

function mockBrowser() {
    return {
        browserAction: mockBrowserAction(),
        runtime: mockRuntime(),
        tabs: mockTabs(),
        windows: mockWindows(),
    }
    function mockBrowserAction() {
        return {
            setTitle: jest.fn()
        }
    }
    function mockRuntime() {
        return {
            onMessage: {
                addListener: jest.fn()
            }
        }
    }
    function mockTabs() {
        return {
            query: getNewPromise,
            onActivated: {
                addListener: jest.fn()
            },
            onUpdated: {
                addListener: jest.fn()
            },
            sendMessage: getNewPromise,
        }
    }
    function getNewPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve('Start of new Promise');
       });
    }
    function mockWindows() {
        return {
            onFocusChanged: {
                addListener: jest.fn()
            }
        }
    }
}

let backgroundModule;

describe("Check module import", () => {
  beforeAll(() => {
      global.browser = mockBrowser();
      runNoHtmlMockDom();
      const jsPathName = '../background.js';
      backgroundModule = require(jsPathName);
  });
  it('The module should be imported without errors and has expected values', function() {
    const result = backgroundModule.__get__('supportedProtocols');
    expect(result).toEqual(['https:', 'http:', 'file:']);
  });
});
