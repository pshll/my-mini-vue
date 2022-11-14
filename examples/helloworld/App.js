import { h } from '../../lib/my-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
	// .vue
	// <template></template>
	// render
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'hard']
			},
			[
				h('div', {}, 'hi, ' + this.msg),
				h(Foo, {
					count: 1,
					onAdd() {
						console.log('on Add')
					},
					onAddFoo() {
						console.log('onAddFoo')
					}
				})
			]
			// setupState
			// 'hello world,' + this.msg
			// Array
			// [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')]
		)
	},
	setup() {
		return {
			msg: 'mini-vue'
		}
	}
}
