import { ShapeFlags } from '@my-mini-vue/shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export { createVNode as createElementVNode }

export function createVNode(type, props?, children?) {
	const vnode = {
		type,
		key: props && props.key,
		el: null,
		props,
		children,
		component: null,
		next: null,
		shapeFlag: getShapeFlag(type)
	}

	if (typeof children === 'string') {
		vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	}

	// slots children
	if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children === 'object') {
			vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
		}
	}

	return vnode
}

export function createTextVNode(text: string) {
	return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
	return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

// 让child支持多个格式
export function normalizeVNode(child) {
	if (typeof child === 'string' || typeof child === 'number') {
		return createVNode(Text, null, String(child))
	} else {
		return child
	}
}
