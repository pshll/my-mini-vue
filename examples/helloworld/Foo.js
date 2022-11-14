import { h } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
	setup(props, { emit }) {
		// props.count
		// props ==> shallow readonly
		const emitAdd = () => {
			emit('add')
			emit('add-foo', 1, 2)
		}
		return {
			emitAdd
		}
	},
	render() {
		const btn = h(
			'button',
			{
				onClick: this.emitAdd
			},
			'emitAdd'
		)
		const foo = h('div', {}, 'foo:' + this.count)
		return h('div', {}, [foo, btn])
	}
}
