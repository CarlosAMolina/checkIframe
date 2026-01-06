import { ButtonAlwaysShowSources } from "../../src/popup/popup";
import { ButtonShowSources } from "../../src/popup/popup";
import { hide, unhide } from "../../src/popup/dom";
import { BUTTON_ID_ALWAYS_SHOW_SOURCES } from "../../src/popup/buttons";

jest.mock("../../src/popup/dom", () => ({
  hide: jest.fn(),
  unhide: jest.fn(),
}));

jest.mock("../../src/popup/popup", () => {
  const originalModule = jest.requireActual("../../src/popup/popup");
  return {
    ...originalModule,
    ButtonShowSources: jest.fn().mockImplementation(() => ({
      showSources: jest.fn().mockResolvedValue(),
    })),
  };
});

global.browser = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

describe("ButtonAlwaysShowSources", () => {
  let button;
  let buttonElement;
  let showSourcesButtonElement;
  let infoTagsElement;
  beforeEach(() => {
    // Clean up mocks before each test
    jest.clearAllMocks();
    // Set up a fake DOM
    document.body.innerHTML = `
      <button id="buttonAlwaysShowSources"></button>
      <button id="buttonShowSources"></button>
      <div id="infoTags"></div>
    `;
    // Get fake DOM elements
    buttonElement = document.getElementById(BUTTON_ID_ALWAYS_SHOW_SOURCES);
    showSourcesButtonElement = document.getElementById("buttonShowSources");
    infoTagsElement = document.getElementById("infoTags");
    // Create a new instance of the button class for each test
    button = new ButtonAlwaysShowSources();
  });
  describe("initializePopup", () => {
    it("should set style to ON and show sources when storage is true", async () => {
      // Arrange
      browser.storage.local.get.mockResolvedValue({
        idTagsInfoAlwaysVisible: true,
      });
      const showSourcesSpy = jest.spyOn(
        ButtonShowSources.prototype,
        "showSources",
      );
      // Act
      await button.initializePopup();
      // Assert
      expect(buttonElement.checked).toBe(true);
      expect(hide).toHaveBeenCalledWith("buttonShowSources");
      expect(unhide).toHaveBeenCalledWith("infoTags");
      expect(showSourcesSpy).toHaveBeenCalledTimes(1);
    });
    it("should set style to OFF when storage is false", async () => {
      // Arrange
      browser.storage.local.get.mockResolvedValue({
        idTagsInfoAlwaysVisible: false,
      });
      const showSourcesSpy = jest.spyOn(
        ButtonShowSources.prototype,
        "showSources",
      );
      // Act
      await button.initializePopup();
      // Assert
      expect(buttonElement.checked).toBe(false);
      expect(hide).not.toHaveBeenCalled();
      expect(unhide).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalled();
    });
    it("should set style to OFF when storage is empty", async () => {
      // Arrange
      browser.storage.local.get.mockResolvedValue({});
      const showSourcesSpy = jest.spyOn(
        ButtonShowSources.prototype,
        "showSources",
      );
      // Act
      await button.initializePopup();
      // Assert
      expect(buttonElement.checked).toBe(false);
      expect(hide).not.toHaveBeenCalled();
      expect(unhide).not.toHaveBeenCalled();
      expect(showSourcesSpy).not.toHaveBeenCalled();
    });
  });
  describe("click", () => {
    it("should turn ON, hide button, show sources, and save state when clicked while OFF", async () => {
      // Arrange - ensure button is OFF initially
      buttonElement.checked = false;
      const showSourcesSpy = jest.spyOn(
        ButtonShowSources.prototype,
        "showSources",
      );
      browser.storage.local.set.mockResolvedValue();
      // Act
      await button.click();
      // Assert
      expect(buttonElement.checked).toBe(true); // Is ON
      expect(hide).toHaveBeenCalledWith("buttonShowSources");
      expect(showSourcesSpy).toHaveBeenCalledTimes(1);
      expect(unhide).toHaveBeenCalledWith("infoTags");
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: true,
      });
    });
    it("should turn OFF, unhide button, and save state when clicked while ON", async () => {
      // Arrange - ensure button is ON initially
      buttonElement.checked = true;
      browser.storage.local.set.mockResolvedValue();
      const showSourcesSpy = jest.spyOn(
        ButtonShowSources.prototype,
        "showSources",
      );
      // Act
      await button.click();
      // Assert
      expect(buttonElement.checked).toBe(false); // Is OFF
      expect(unhide).toHaveBeenCalledWith("buttonShowSources");
      expect(hide).not.toHaveBeenCalled(); // Should not hide anything
      expect(showSourcesSpy).not.toHaveBeenCalled(); // Should not show sources
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        idTagsInfoAlwaysVisible: false,
      });
    });
  });
});
