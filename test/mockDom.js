// https://stackoverflow.com/questions/41098009/mocking-document-in-jest

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom"

export function runMockDom(htmlPathName) {
    const __dirname = path.resolve();
    const htmlPath = path.resolve(__dirname, htmlPathName);
    const html = fs.readFileSync(htmlPath, 'utf8')
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.window = dom.window;
}

