import { runNoHtmlMockDom } from './mockDom.js';

function mockBrowser() {
    return {
        browserAction: {
            setIcon: jest.fn(),
            setTitle: jest.fn()
        },
        runtime: {
            onMessage: {
                addListener: jest.fn()
            }
        },
        tabs: {
            query: getNewPromise,
            onActivated: {
                addListener: jest.fn()
            },
            onUpdated: {
                addListener: jest.fn()
            },
            sendMessage: getNewPromise,
        },
        windows: {
            onFocusChanged: {
                addListener: jest.fn()
            }
        }
    }
    function getNewPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve('Start of new Promise');
       });
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
  it('updateActiveTab runs without error', function() {
      function_ = backgroundModule.__get__('updateActiveTab');
      function_();
  });
  it('updateIcon runs without error', function() {
      function_ = backgroundModule.__get__('updateIcon');
      function_();
  });
});
