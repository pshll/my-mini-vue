import { h, ref, getCurrentInstance, nextTick } from '../../dist/my-mini-vue.esm.js'

export const App = {
	name: 'App',
	render() {
		return h('div', {}, [
			h('button', { onClick: this.onClick }, 'update'),
			h('p', {}, `count: ${this.count}`)
		])
	},
	setup() {
		const count = ref(1)

		const instance = getCurrentInstance()

		function onClick() {
			for (let i = 0; i < 100; i++) {
				count.value = i
			}

			console.log(instance.vnode.el.innerText)
			// await nextTick()
			nextTick(() => {
				console.log(instance.vnode.el.innerText)
			})
		}
		return {
			count,
			onClick
		}
	}
}
