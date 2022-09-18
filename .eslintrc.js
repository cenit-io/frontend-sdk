module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'import',
  ],
  settings: {
    'import/parser': 'babel-eslint',
    'import/resolve': {
      moduleDirectory: ['node_modules', 'src'],
    },
  },
  rules: {
    'import/no-named-as-default': ['off'],
    'react/static-property-placement': ['off', 'property assignment'],
    'react/prefer-stateless-function': ['off'],
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
    'react/jsx-max-props-per-line': ['warn', { maximum: 3, when: 'multiline' }],
    'react/jsx-props-no-spreading': ['off'],
    'object-curly-newline': ['error', {
      ObjectExpression: {
        multiline: true, minProperties: 5, consistent: true,
      },
      ObjectPattern: {
        multiline: true, minProperties: 6, consistent: true,
      },
    }],
    'max-len': ['error', {
      code: 120,
      ignoreTrailingComments: true,
      ignoreRegExpLiterals: true,
      ignoreUrls: true,
      ignoreStrings: true,
    }],
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-underscore-dangle': ['error', { allowAfterThis: true, allowAfterThisConstructor: true }],
    'no-unused-vars': ['error', { args: 'none' }],
    'class-methods-use-this': ['off'],
  },
};
