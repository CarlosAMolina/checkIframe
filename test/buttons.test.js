import { ButtonShowLogs } from "../src/popup/buttons.js";

// TODO rm NEW
describe("Check NEWButtonShowLogs", () => {
  it.only("Check it has correct button ID value", function () {
    const button = new ButtonShowLogs();
    expect(button.buttonIdHtml).toBe("buttonShowLogs");
  });
});
