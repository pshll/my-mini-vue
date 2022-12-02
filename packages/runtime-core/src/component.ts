import { shallowReadonly, proxyRefs } from '@my-mini-vue/reactivity'
import { NOOP } from '@my-mini-vue/shared'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

let currentInstance = null

let uid = 0

let compile

export function createComponentInstance(vnode, parent) {
	const instance = {
		uid: uid++,
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		emit: () => {},
		slots: {},
		provides: parent ? parent.provides : {},
		parent,
		isMounted: false,
		subTree: {}
	}

	instance.emit = emit.bind(null, instance) as any

	return instance
}

export function setupComponent(instance) {
	// TODO initSlots()
	initSlots(instance, instance.vnode.children)
	initProps(instance, instance.vnode.props)
	setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
	const Component = instance.type

	// ctx
	instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

	const { setup } = Component

	if (setup) {
		setCurrentInstace(instance)
		// function || object
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})

		setCurrentInstace(null)

		handleSetupResult(instance, setupResult)
	}
}

function handleSetupResult(instance, setupResult) {
	// TODO typof function
	if (typeof setupResult === 'object') {
		instance.setupState = proxyRefs(setupResult)
	}

	finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
	const Component = instance.type

	// template / render function normalization
	// could be already set when returned from setup()
	if (!instance.render) {
		if (compile && !Component.render) {
			// template
			if (Component.template) {
				const template = Component.template
				Component.render = compile(template)
			}
		}
		instance.render = Component.render || NOOP
	}
}

export function getCurrentInstance() {
	return currentInstance
}

export function setCurrentInstace(instance) {
	currentInstance = instance
}

/**
 * For runtime-dom to register the compiler.
 * Note the exported method uses any to avoid d.ts relying on the compiler types.
 */
export function registerRuntimeCompiler(_compile: any) {
	compile = _compile
}
