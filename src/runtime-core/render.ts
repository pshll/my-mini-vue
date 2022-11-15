import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './createVNode'

export function render(vnode, container) {
	patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
	// ShapeFlags
	// vnode -> flag
	// 处理组件
	const { type, shapeFlag } = vnode

	// Fragment -> 只渲染children
	switch (type) {
		case Fragment:
			processFragment(vnode, container, parentComponent)
			break
		case Text:
			processText(vnode, container)
			break
		default:
			if (shapeFlag & ShapeFlags.ELEMENT) {
				processElement(vnode, container, parentComponent)
				// STATEFUL_COMPONENT
			} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
				processComponent(vnode, container, parentComponent)
			}
			break
	}
}

function processText(vnode: any, container: any) {
	const { children } = vnode
	const textNode = (vnode.el = document.createTextNode(children))
	container.append(textNode)
}
function processFragment(vnode: any, container: any, parentComponent) {
	mountChildren(vnode, container, parentComponent)
}

function processElement(vnode: any, container: any, parentComponent) {
	// init
	mountElement(vnode, container, parentComponent)
}

function processComponent(vnode: any, container: any, parentComponent) {
	mountComponent(vnode, container, parentComponent)
}

function mountElement(vnode: any, container, parentComponent) {
	const el = (vnode.el = document.createElement(vnode.type))

	const { children, shapeFlag } = vnode

	// children
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		// text_children
		el.textContent = children
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
		// array_children
		mountChildren(vnode, el, parentComponent)
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

function mountChildren(vnode, container, parentComponent) {
	vnode.children.forEach((v) => {
		patch(v, container, parentComponent)
	})
}

function mountComponent(initialVNode: any, container, parentComponent) {
	const instance = createComponentInstance(initialVNode, parentComponent)

	setupComponent(instance)
	setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode, container) {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)

	// vnode Tree
	// vnode -> element -> mountElement
	patch(subTree, container, instance)

	initialVNode.el = subTree.el
}
