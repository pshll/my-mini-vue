export * from '@my-mini-vue/runtime-dom'

import { baseCompile } from '@my-mini-vue/compiler-core'
import { registerRuntimeCompiler } from '@my-mini-vue/runtime-dom'
import * as runtimeDom from '@my-mini-vue/runtime-dom'

function compileToFunction(template) {
	const { code } = baseCompile(template)
	const render = new Function('Vue', code)(runtimeDom)
	return render
}

registerRuntimeCompiler(compileToFunction)
