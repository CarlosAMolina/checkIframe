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
  prettier,
];
