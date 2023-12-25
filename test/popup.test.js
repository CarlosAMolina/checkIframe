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
            get: newPromise,
            set: newPromise
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
let buttonType;
let button;
let function_;
const buttonIdsHtml = [
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

  describe("Check createButton", () => {
      beforeAll(() => {
          function_ = ModulePopup.__get__('createButton');
      });
      // Parametrized test.
      it.each(buttonIdsHtml)('Check if valid button ID: %p', (buttonIdHtml) => {
          const result = function_(buttonIdHtml)._buttonIdHtml;
          expect(result).toBe(buttonIdHtml);
      });
      it("Check if invalid button ID", function() {
          const buttonIdHtml = "nonexistent";
          const result = function_(buttonIdHtml);
          expect(result).toBe(false);
      });
  });
  describe("Check ButtonClicked", () => {
    beforeAll(() => {
        buttonType = ModulePopup.__get__('ButtonClicked');
        const buttonIdHtml = "idTest";
        button = new buttonType(buttonIdHtml);
    });
    it("Check buttonIdHtml returns expected result", function() {
        const result = button.buttonIdHtml;
        expect(result).toBe("idTest");
    });
    it("Check run throws error", function() {
        try {
            button.run
            expect(true).toBe(false);
        } catch (e) {
            expect(e.message).toBe("Not implemented: method run");
        }
    });
    it("Check logButtonName logs expected message", function() {
        console.log = jest.fn();
        button.logButtonName;
        expect(console.log).toHaveBeenCalledWith('Clicked button ID Html: idTest');
    });
  });
  describe("Check buttons", () => {
    it.each(buttonIdsHtml)('Check if button ID %p run does not throw error', (buttonIdHtml) => {
        const createButton = ModulePopup.__get__('createButton');
        const button = createButton(buttonIdHtml);
        button.run;
    });
  });
});
