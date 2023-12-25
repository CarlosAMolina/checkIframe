import { runMockDom } from './mockDom.js';

function mockBrowser() {
    return {
        storage: mockLocalStorage(),
        tabs: mockTabs()
    }
    // https://stackoverflow.com/questions/11485420/how-to-mock-localstorage-in-javascript-unit-tests
    function mockLocalStorage() {
        function mockGetLocalStorage() {
          return {
            get: newPromise
          };
        }
        return {
            local: mockGetLocalStorage()
        }
    }
    function mockTabs() {
        return {
            executeScript: newPromise,
            query: newPromise,
            sendMessage: newPromise
        }
    }
    function newPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve('Start of new Promise');
       });
    }
}

describe("Check module import", () => {
  beforeAll(() => {
      const htmlPathName = 'popup/popup.html';
      runMockDom(htmlPathName);
      global.browser = mockBrowser();
  });
  it('The DOM has expected values', function() {
    expect(document.getElementById('pInput').textContent).toBe('New values');
  });
  it('The module should be imported without errors and has expected values', function() {
    const ModulePopup = require('../popup/popup.js');
    expect(ModulePopup.__get__('urlTypeBlacklist')).toBe('blacklist');
  });

  it("Check createButton if invalid button ID: ", function() {
      const ModulePopup = require('../popup/popup.js');
      const function_ = ModulePopup.__get__('createButton');
      const buttonIdHtml = "nonexistent";
      const result = function_(buttonIdHtml);
      expect(result).toBe(false);
  });
  it("Check createButton if valid button ID: ", function() {
      const ModulePopup = require('../popup/popup.js');
      const function_ = ModulePopup.__get__('createButton');
      const buttonIdHtml = "buttonRecheck";
      const result = function_(buttonIdHtml)._buttonIdHtml;
      expect(result).toBe("buttonRecheck");
  });
});
