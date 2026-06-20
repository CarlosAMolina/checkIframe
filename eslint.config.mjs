import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["src/**/*.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Browser API
        browser: "writable",
        navigator: "readonly",
        setTimeout: "readonly",
        // Jest
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        expect: "readonly",
        jest: "readonly",
        // Node/CommonJS (for tests)
        require: "readonly",
        global: "readonly",
        // DOM
        document: "readonly",
        window: "readonly",
        console: "readonly",
      },
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ["src/content_scripts/check-and-border.js"],
    languageOptions: {
      globals: {
        // exports is used in the _forTesting block to expose internals to Jest.
        // It is guarded by typeof so it is safe in the browser where exports is undefined.
        exports: "writable",
      },
    },
  },
  prettier,
];
