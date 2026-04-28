const firebaseRulesPlugin = require('@firebase/eslint-plugin-security-rules');

module.exports = [
  {
    ignores: ['dist/**/*']
  },
  {
    files: ['*.rules'],
    plugins: {
      '@firebase/security-rules': firebaseRulesPlugin,
    },
    languageOptions: {
      parser: firebaseRulesPlugin.preprocessors['.rules'].parser,
    },
    rules: {
      ...firebaseRulesPlugin.configs['flat/recommended'].rules,
    },
  },
];
