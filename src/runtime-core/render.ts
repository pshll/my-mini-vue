import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './createVNode'

export function render(vnode, container) {
	patch(vnode, container)
}

function patch(vnode, container) {
	// ShapeFlags
	// vnode -> flag
	// 处理组件
	const { type, shapeFlag } = vnode

	// Fragment -> 只渲染children
	switch (type) {
		case Fragment:
			processFragment(vnode, container)
			break
		case Text:
			processText(vnode, container)
			break
		default:
			if (shapeFlag & ShapeFlags.ELEMENT) {
				processElement(vnode, container)
				// STATEFUL_COMPONENT
			} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
				processComponent(vnode, container)
			}
			break
	}
}

function processText(vnode: any, container: any) {
	const { children } = vnode
	const textNode = (vnode.el = document.createTextNode(children))
	container.append(textNode)
}
function processFragment(vnode: any, container: any) {
	mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
	// init
	mountElement(vnode, container)
}

function processComponent(vnode: any, container: any) {
	mountComponent(vnode, container)
}

function mountElement(vnode: any, container) {
	const el = (vnode.el = document.createElement(vnode.type))

	const { children, shapeFlag } = vnode

	// children
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		// text_children
		el.textContent = children
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
		// array_children
		mountChildren(vnode, el)
	}

	const { props } = vnode
	for (const key in props) {
		const val = props[key]

		// on + Event name
		const isOn = (key: string) => /^on[A-Z]/.test(key)
		if (isOn(key)) {
			const event = key.slice(2).toLocaleLowerCase()
			el.addEventListener(event, val)
		} else {
			el.setAttribute(key, val)
		}
	}

	container.append(el)
}

function mountChildren(vnode, container) {
	vnode.children.forEach((v) => {
		patch(v, container)
	})
}

function mountComponent(initialVNode: any, container) {
	const instance = createComponentInstance(initialVNode)

	setupComponent(instance)
	setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode, container) {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)

	// vnode Tree
	// vnode -> element -> mountElement
	patch(subTree, container)

	initialVNode.el = subTree.el
}
