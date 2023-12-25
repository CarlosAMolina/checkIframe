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

// https://stackoverflow.com/questions/52397708/how-to-pass-variable-from-beforeeach-hook-to-tests-in-jest
let ModulePopup;

describe("Check module import", () => {
  beforeAll(() => {
      const htmlPathName = 'popup/popup.html';
      runMockDom(htmlPathName);
      global.browser = mockBrowser();
      const popupJsPathName = '../popup/popup.js';
      ModulePopup = require(popupJsPathName);
  });
  it('The DOM has expected values', function() {
    expect(document.getElementById('pInput').textContent).toBe('New values');
  });
  it('The module should be imported without errors and has expected values', function() {
    expect(ModulePopup.__get__('urlTypeBlacklist')).toBe('blacklist');
  });

  // Parametrized test.
  it.each(
      [
        'buttonRecheck',
        'buttonClean',
        'buttonScroll',
        'buttonShowSources',
        'buttonShowConfig',
        'buttonShowLogs',
        'buttonUrlsNotify',
        'buttonUrlsBlacklist',
        'buttonUrlsReferer',
        'buttonAddUrl',
        'buttonClearAll'
      ]
  )('Check createButton if valid button ID: %p', (buttonIdHtml) => {
      const function_ = ModulePopup.__get__('createButton');
      const result = function_(buttonIdHtml)._buttonIdHtml;
      expect(result).toBe(buttonIdHtml);
  });
  it("Check createButton if invalid button ID", function() {
      const function_ = ModulePopup.__get__('createButton');
      const buttonIdHtml = "nonexistent";
      const result = function_(buttonIdHtml);
      expect(result).toBe(false);
  });
  it("Check ButtonClicked buttonIdHtml() returns expected result", function() {
      const buttonClickedType = ModulePopup.__get__('ButtonClicked');
      const buttonIdHtml = "idTest";
      const buttonClicked = new buttonClickedType(buttonIdHtml);
      const result = buttonClicked.buttonIdHtml;
      expect(result).toBe(buttonIdHtml);
  });
  it("Check ButtonClicked run() throws error", function() {
      const buttonClickedType = ModulePopup.__get__('ButtonClicked');
      const buttonIdHtml = "idTest";
      const buttonClicked = new buttonClickedType(buttonIdHtml);
      try {
          buttonClicked.run
          expect(true).toBe(false);
      } catch (e) {
          expect(e.message).toBe("Not implemented: method run");
      }
  });
});
