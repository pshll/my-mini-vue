import { h, createTextVNode, getCurrentInstance } from '../../dist/my-mini-vue.esm.js'
import { Foo } from './Foo.js'

// export const App = {
// 	// .vue
// 	// <template></template>
// 	// render
// 	render() {
// 		const app = h('div', {}, 'hi, ' + this.msg)
// 		// vnode
// 		// const foo = h(Foo, {}, h('p', {}, '_slot_single_'))
// 		// 数组
// 		// const foo = h(Foo, {}, [h('p', {}, '_slot_array_1_'), h('p', {}, '_slot_array_2_')])
// 		// 具名插槽
// 		const foo = h(
// 			Foo,
// 			{},
// 			{
// 				header: ({ age }) => [
// 					h('p', {}, '_slot_array_1_' + age),
// 					createTextVNode('textNode')
// 				],
// 				footer: () => h('p', {}, '_slot_array_2_')
// 			}
// 		)
// 		return h(
// 			'div',
// 			{
// 				id: 'root',
// 				class: ['red', 'hard']
// 			},
// 			[app, foo]
// 			// setupState
// 			// 'hello world,' + this.msg
// 			// Array
// 			// [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
// 		)
// 	},
// 	setup() {
// 		return {
// 			msg: 'mini-vue'
// 		}
// 	}
// }

// getCurrentInstance
export const App = {
	name: 'App',
	render() {
		return h('div', {}, [h('p', {}, 'currentInstance demo'), h(Foo)])
	},
	setup() {
		const instance = getCurrentInstance()
		console.log('App: ', instance)
	}
}
