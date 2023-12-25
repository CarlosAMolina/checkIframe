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

  it('The module should be imported without errors', function() {
    console.log('init');
    const ModulePopup = require('../popup/popup.js');
    console.log(`popup.js urls: '${ModulePopup.urls}'`);
    console.log(document.getElementById('inputUrl'));
    ModulePopup.add_url('foo.com');
    console.log(`popup.js urls: '${ModulePopup.urls}'`);
    console.log('end');
  });
});
