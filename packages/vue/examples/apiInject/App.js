import { h, provide, inject } from '../../dist/my-mini-vue.esm.js'

const Consumer = {
	name: 'Consumer',
	setup() {
		const foo = inject('foo')
		const bar = inject('bar')
		const baz = inject('baz', 'bazDefault')
		const baz1 = inject('baz1', () => 'baz1Default')
		return {
			foo,
			bar,
			baz,
			baz1
		}
	},
	render() {
		return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.baz1}`)
	}
}

const Provide = {
	name: 'Provide',
	setup() {
		provide('foo', 'fooVal')
		provide('bar', 'barVal')
	},
	render() {
		return h('div', {}, [h('p', {}, 'Provide'), h(ProvideTwo)])
	}
}

const ProvideTwo = {
	name: 'ProvideTwo',
	setup() {
		provide('foo', 'fooTwo')
		const foo = inject('foo')
		return { foo }
	},
	render() {
		return h('div', {}, [
			h('p', {}, `ProvideTwo foo: fooVal ==>? ${this.foo}`),
			h(ProvideThree)
		])
	}
}

const ProvideThree = {
	name: 'ProvideThree',
	setup() {},
	render() {
		return h('div', {}, [h('p', {}, 'ProvideThree'), h(Consumer)])
	}
}

export const App = {
	name: 'App',
	setup() {},
	render() {
		return h('div', {}, [h('p', {}, 'apiInject'), h(Provide)])
	}
}
