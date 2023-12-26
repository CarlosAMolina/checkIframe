import { runNoHtmlMockDom } from './mockDom.js';

function mockBrowser() {
    return {
        browserAction: {
            getTitle: getNewPromise,
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
                addListener: jest.fn(),
                removeListener: jest.fn()
            },
            onUpdated: {
                addListener: jest.fn(),
                removeListener: jest.fn()
            },
            sendMessage: getNewPromise,
            update: getNewPromise
        },
        windows: {
            onFocusChanged: {
                addListener: jest.fn(),
                removeListener: jest.fn()
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
  it('change2iconOnInList runs without error', function() {
      function_ = backgroundModule.__get__('change2iconOnInList');
      function_();
  });
  it('change2iconOn runs without error', function() {
      function_ = backgroundModule.__get__('change2iconOn');
      function_();
  });
  it('change2iconOff runs without error', function() {
      function_ = backgroundModule.__get__('change2iconOff');
      function_();
  });
  it('changeTitle runs without error', function() {
      function_ = backgroundModule.__get__('changeTitle');
      function_();
  });
  it('updateTitle runs without error', function() {
      function_ = backgroundModule.__get__('updateTitle');
      function_();
  });
  it('getIconTitleAndUpdateIcon runs without error', function() {
      function_ = backgroundModule.__get__('getIconTitleAndUpdateIcon');
      function_();
  });
  it('saveMessageAndUpdateTittle runs without error', function() {
      function_ = backgroundModule.__get__('saveMessageAndUpdateTittle');
      const message = jest.fn();
      function_(message);
  });
  it('checkRunRedirect runs without error', function() {
      backgroundModule.__set__('referers', []);
      function_ = backgroundModule.__get__('checkRunRedirect');
      function_();
      backgroundModule.__set__('referers', undefined);
  });
  it('redirectTo runs without error', function() {
      function_ = backgroundModule.__get__('redirectTo');
      function_();
  });
  it('sendValue runs without error', function() {
      function_ = backgroundModule.__get__('sendValue');
      function_();
  });
  it('reportError runs without error', function() {
      function_ = backgroundModule.__get__('reportError');
      function_();
  });
  it('sendAmessage runs without error', function() {
      function_ = backgroundModule.__get__('sendAmessage');
      function_();
  });
  it('handleUpdatedWindow runs without error', function() {
      function_ = backgroundModule.__get__('handleUpdatedWindow');
      function_();
  });
  it('handleUpdatedTabUrl runs without error', function() {
      function_ = backgroundModule.__get__('handleUpdatedTabUrl');
      function_(undefined, jest.fn());
  });
  it('handleActivatedTab runs without error', function() {
      function_ = backgroundModule.__get__('handleActivatedTab');
      function_(jest.fn());
  });
  it('sleepMs runs without error', function() {
      function_ = backgroundModule.__get__('sleepMs');
      function_(jest.fn());
  });
});
