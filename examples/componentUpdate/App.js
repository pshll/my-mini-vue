import { h, ref } from '../../lib/my-mini-vue.esm.js'
import Child from './Child.js'

export default {
	name: 'App',
	setup() {
		const msg = ref('123')
		window.msg = msg

		const changeChildProps = () => {
			msg.value = '456'
		}

		const count = ref(1)
		const changeCount = () => {
			count.value++
		}

		return { msg, changeChildProps, count, changeCount }
	},

	render() {
		return h('div', {}, [
			h('div', {}, '你好'),
			h(
				'button',
				{
					onClick: this.changeChildProps
				},
				'change child props'
			),
			h(Child, {
				msg: this.msg
			}),
			h('br', {}, null),
			h('p', {}, `count ==> ${this.count}`),
			h(
				'button',
				{
					onClick: this.changeCount
				},
				'chang count'
			)
		])
	}
}
