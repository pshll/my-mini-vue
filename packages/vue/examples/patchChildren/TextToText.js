import { h, ref } from '../../dist/my-mini-vue.esm.js'

const prevChildren = 'oldChildren'

const nextChildren = 'newChildren'

export default {
	name: 'ArrayToText',
	setup() {
		const isChange = ref(false)
		window.isChange = isChange
		return {
			isChange
		}
	},
	render() {
		const self = this
		return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
	}
}
