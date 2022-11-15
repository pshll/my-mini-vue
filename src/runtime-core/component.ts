import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

let currentInstance = null

export function createComponentInstance(vnode, parent) {
	const instance = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		emit: () => {},
		slots: {},
		provides: parent ? parent.provides : {},
		parent
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
		instance.setupState = setupResult
	}

	finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
	const Component = instance.type

	if (Component.render) {
		instance.render = Component.render
	}
}

export function getCurrentInstance() {
	return currentInstance
}

export function setCurrentInstace(instance) {
	currentInstance = instance
}
