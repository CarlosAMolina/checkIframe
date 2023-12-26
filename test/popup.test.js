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
            get: getEmptyNewPromise, // Required to run all storeInfo() if-else code.
            set: getNewPromise
          };
        }
        return {
            local: mockGetLocalStorage()
        }
    }
    function mockTabs() {
        return {
            executeScript: getNewPromise,
            query: getNewPromise,
            sendMessage: getNewPromise
        }
    }
    function getNewPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve('Start of new Promise');
       });
    }
    function getEmptyNewPromise(args) {
       return new Promise(function(resolve, reject) {
           resolve({});
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
  it('deleteAllUrlType runs without error', function() {
      function_ = ModulePopup.__get__('deleteAllUrlType');
      const results = {}
      function_(results);
  });
  it('enableElementsConfiguration runs without error', function() {
      function_ = ModulePopup.__get__('enableElementsConfiguration');
      function_();
  });
  it('showStoredInfo runs without error', function() {
      function_ = ModulePopup.__get__('showStoredInfo');
      function_();
  });
  it('getIdHtmlOfClickedButtonOrImageFromEventClick runs without error', function() {
      function_ = ModulePopup.__get__('getIdHtmlOfClickedButtonOrImageFromEventClick');
      const eventClick = {'target': {'id': 1}};
      function_(eventClick);
  });
  it('hideInfo runs without error', function() {
      function_ = ModulePopup.__get__('hideInfo');
      const htmlId = 'infoScroll';
      function_(htmlId);
  });
  it('showTagsInfo runs without error', function() {
      function_ = ModulePopup.__get__('showTagsInfo');
      const htmlId = 'infoScroll';
      function_(htmlId);
  });
  it('sendInfo runs without error', function() {
      function_ = ModulePopup.__get__('sendInfo');
      const tabs = [{"id": "a"}];
      function_(tabs);
  });
  it('showOrHideInfo runs without error', function() {
      function_ = ModulePopup.__get__('showOrHideInfo');
      const htmlId = 'infoScroll';
      function_(htmlId);
  });
  it('showStoredUrlsType runs without error', function() {
      function_ = ModulePopup.__get__('showStoredUrlsType');
      function_();
  });
  it('sendInfoAndValue runs without error', function() {
      function_ = ModulePopup.__get__('sendInfoAndValue');
      function_();
  });
  it('sendInfoSaveAndShowAnswer runs without error', function() {
      console.error = jest.fn();
      function_ = ModulePopup.__get__('sendInfoSaveAndShowAnswer');
      const tabs = [{"id": "a"}];
      function_(tabs);
  });
  it('changeParagraph runs without error', function() {
      const sourceTagSummary = {
          sourcesAllNumber : 0,
          sourcesValid: []
      }
      const response = {'foo': sourceTagSummary};
      const htmlId='infoTags';
      ModulePopup.__set__('info2sendFromPopup', 'buttonShowSources');
      function_ = ModulePopup.__get__('changeParagraph');
      function_(response, htmlId);
      ModulePopup.__set__('info2sendFromPopup', '');
  });
  it('enableElements runs without error', function() {
      function_ = ModulePopup.__get__('enableElements');
      const htmlIdsToChange = ["pInput"];
      function_(htmlIdsToChange);
  });
  it('listSourceTagSummary runs without error', function() {
      function_ = ModulePopup.__get__('listSourceTagSummary');
      const sourceTagSummary = {
          sourcesAllNumber : 0,
          sourcesValid: []
      }
      function_("foo", sourceTagSummary);
  });
  it('cleanShowSources runs without error', function() {
      const valueToSet = ModulePopup.__get__('infoContainer');
      // Required to run all code.
      ModulePopup.__set__('sourcesContainer', valueToSet);
      function_ = ModulePopup.__get__('cleanShowSources');
      function_();
  });
  it('removeShownStoredUrls runs without error', function() {
      function_ = ModulePopup.__get__('removeShownStoredUrls');
      function_();
  });
  it('saveShowLogs runs without error', function() {
      function_ = ModulePopup.__get__('saveShowLogs');
      function_();
  });
  describe("Check modify urls", () => {
      beforeAll(() => {
          ModulePopup.__set__('urlType', 'blacklist');
      });
      afterEach(() => {
          ModulePopup.__set__('urlType', '');
      });
      it('deleteUrl runs without error', function() {
          function_ = ModulePopup.__get__('deleteUrl');
          const eKey = 'blacklist_foo';
          function_(eKey);
      });
      it('addUrl runs without error', function() {
          function_ = ModulePopup.__get__('addUrl');
          const eKey = 'blacklist_foo';
          function_(eKey);
      });
  });
  it('saveUrl runs without error', function() {
      function_ = ModulePopup.__get__('saveUrl');
      function_();
  });
  it('storeInfo runs without error', function() {
      ModulePopup.__set__('info2save', ["value_1"]);
      function_ = ModulePopup.__get__('storeInfo');
      function_();
  });
  it('reportError logs expected message', function() {
      function_ = ModulePopup.__get__('reportError');
      console.error = jest.fn();
      function_('foo message');
      expect(console.error).toHaveBeenCalledWith('Error: foo message');
  });
  it('reportExecuteScriptError runs without error', function() {
      function_ = ModulePopup.__get__('reportExecuteScriptError');
      const error = {};
      function_(error);
  });
  describe("Check buttons", () => {
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
      describe('Check buttons run without error', () => {
          it.each(buttonIdsHtml)('Check button ID %p ', (buttonIdHtml) => {
              console.log = jest.fn(); // Avoid lot of logs on the screen.
              const createButton = ModulePopup.__get__('createButton');
              const button = createButton(buttonIdHtml);
              button.run;
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
  });
});
