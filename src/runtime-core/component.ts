import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode) {
	const instance = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		emit: () => {}
	}

	instance.emit = emit.bind(null, instance) as any

	return instance
}

export function setupComponent(instance) {
	// TODO initSlots()
	// initProps()
	initProps(instance, instance.vnode.props)
	setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
	const Component = instance.type

	// ctx
	instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

	const { setup } = Component

	if (setup) {
		// function || object
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})

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
