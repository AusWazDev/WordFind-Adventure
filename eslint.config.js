import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: [
      "src/components/**/*.{js,mjs,cjs,jsx}",
      "src/pages/**/*.{js,mjs,cjs,jsx}",
      "src/Layout.jsx",
    ],
    ignores: ["src/lib/**/*", "src/components/ui/**/*"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error",

      // Ban direct window.location access in components — always broken with HashRouter.
      // DEF-13: window.location.assign() caused hard reloads → 404 on Vercel.
      // DEF-36: window.location.search always empty with HashRouter → params silently lost.
      // Use React Router hooks instead: useSearchParams, useNavigate, useLocation.
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.object.name='window'][object.property.name='location'][property.name='search']",
          message: "window.location.search is always empty with HashRouter. Use useSearchParams() from react-router-dom instead.",
        },
        {
          selector: "MemberExpression[object.object.name='window'][object.property.name='location'][property.name='hash']",
          message: "window.location.hash bypasses the router. Use useLocation() from react-router-dom instead.",
        },
        {
          selector: "CallExpression[callee.object.object.name='window'][callee.object.property.name='location'][callee.property.name='assign']",
          message: "window.location.assign() causes hard reloads and breaks HashRouter. Use navigate() from react-router-dom instead.",
        },
      ],
    },
  },
];
