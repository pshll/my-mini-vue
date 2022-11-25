import { h } from '../../lib/my-mini-vue.esm.js'

export default {
	name: 'Child',
	setup(props, { emit }) {
		const emitShow = () => {
			emit('show')
		}
		return {
			emitShow
		}
	},
	render(proxy) {
		return h('div', {}, [h('div', {}, 'child' + this.$props.msg)])
	}
}
