import { h } from '../../lib/my-mini-vue.esm.js'
import PatchChildren from './PatchChildren.js'
import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'

export default {
	name: 'App',
	setup() {},

	render() {
		return h('div', { tId: 1 }, [h('p', {}, '主页'), h(TextToArray)])
	}
}
