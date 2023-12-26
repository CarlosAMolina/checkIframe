import { runNoHtmlMockDom } from './mockDom.js';

function mockBrowser() {
    return {
        runtime: {
            onMessage: {
                addListener: jest.fn()
            }
        },
        storage: {
            local: {
                get: getNewPromise
            }
        }
    }
    function getNewPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve('Start of new Promise');
       });
    }
}

let checkAndBorderModule;

describe("Check module import", () => {
  beforeAll(() => {
      global.browser = mockBrowser();
      runNoHtmlMockDom();
      const jsPathName = '../checkAndBorder.js';
      checkAndBorderModule = require(jsPathName);
  });
  it('The module should be imported without errors and has expected values', function() {
    const result = checkAndBorderModule.__get__('urlTypeBlacklist');
    expect(result).toEqual('blacklist');
  });
  // TODO it('updateActiveTab runs without error', function() {
  // TODO     function_ = checkAndBorderModule.__get__('updateActiveTab');
  // TODO     function_();
  // TODO });
});
