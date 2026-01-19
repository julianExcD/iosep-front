import ts from '@eslint/ts';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default [
	{
		files: ['**/*.vue', '**/*.ts'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: babelParser,
				ecmaVersion: 2021,
				sourceType: 'module',
				requireConfigFile: false,
			},
			globals: {
				...globals.browser,
				...globals.es2021,
			},
		},
		plugins: {
			vue,
		},
		rules: {
			...ts.configs.recommended.rules,
			...vue.configs.recommended.rules,
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'vue/no-unused-vars': 'warn',
			'vue/multi-word-component-names': 'off',
		},
	},
];
