// // import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
	// input: './src/index.ts',
	input: './packages/vue/src/index.ts',
	output: [
		// 1.cjs -> commonjs
		// 2.esm -> es6
		{
			format: 'cjs',
			file: 'packages/vue/dist/my-mini-vue.cjs.js'
			// file: pkg.main
		},
		{
			format: 'es',
			// file: pkg.module
			file: 'packages/vue/dist/my-mini-vue.esm.js'
		}
	],
	plugins: [commonjs(), typescript(), json(), resolve()],
	onwarn: (msg, warn) => {
		// 忽略 Circular 的错误
		if (!/\w/.test(msg)) {
			warn(msg)
		}
		if (!/Circular/.test(msg)) {
			warn(msg)
		}
	}
}
