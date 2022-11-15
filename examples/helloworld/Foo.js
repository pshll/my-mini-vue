import { h, renderSlot, getCurrentInstance } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
	name: 'Foo',
	setup(props, { emit }) {
		const instance = getCurrentInstance()
		console.log('Foo: ', instance)
		// const emitAdd = () => {
		// 	emit('add')
		// 	emit('add-foo', 1, 2)
		// }
		// return {
		// 	emitAdd
		// }
		return {}
	},
	render() {
		// 作用域插槽
		const age = 18
		// const btn = h(
		// 	'button',
		// 	{
		// 		onClick: this.emitAdd
		// 	},
		// 	'emitAdd'
		// )
		// const foo = h('div', {}, 'foo:' + this.count)
		// return h('div', {}, [foo, btn])
		// const foo = h('p', {}, 'foo')
		// return h('div', {}, [foo, h('div',{},this.$slots)])
		// 指定元素渲染位置
		// return h('div', {}, [
		// 	// 具名插槽
		// 	renderSlot(this.$slots, 'header', {
		// 		age
		// 	}),
		// 	foo,
		// 	renderSlot(this.$slots, 'footer')
		// ])
		return h('div', {}, 'foo')
	}
}
