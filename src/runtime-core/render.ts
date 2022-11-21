import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './createVNode'

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
		remove: hostRemove,
		setElementText: hostSetElementText
	} = options

	function render(vnode, container) {
		patch(null, vnode, container, null)
	}

	/**
	 * @description:
	 * @param {*} n1 -> oldVnode
	 * @param {*} n2 -> newVnode
	 * @param {*} container
	 * @param {*} parentComponent
	 * @return {*}
	 */
	function patch(n1, n2, container, parentComponent) {
		// ShapeFlags
		// vnode -> flag
		// 处理组件
		const { type, shapeFlag } = n2

		// Fragment -> 只渲染children
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent)
					// STATEFUL_COMPONENT
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent)
				}
				break
		}
	}

	function processText(n1: any, n2: any, container: any) {
		const { children } = n2
		const textNode = (n2.el = document.createTextNode(children))
		container.append(textNode)
	}
	function processFragment(n1, n2: any, container: any, parentComponent) {
		mountChildren(n2.children, container, parentComponent)
	}

	function processElement(n1, n2: any, container: any, parentComponent) {
		// init
		if (!n1) {
			mountElement(n2, container, parentComponent)
		} else {
			patchElement(n1, n2, container, parentComponent)
		}
	}

	function patchElement(n1, n2, container, parentComponent) {
		const oldProps = n1.props || EMPTY_OBJ
		const newProps = n2.props || EMPTY_OBJ

		const el = (n2.el = n1.el)

		patchChildren(n1, n2, el, parentComponent)
		patchProps(el, oldProps, newProps)
	}

	function patchChildren(n1, n2, container, parentComponent) {
		const prevShapFlag = n1.shapeFlag
		const shapeFlag = n2.shapeFlag
		const c1 = n1.children
		const c2 = n2.children
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
				// array -> text
				unmountChildren(n1.children)
			}
			if (c1 !== c2) {
				hostSetElementText(container, c2)
			}
		}

		if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
				hostSetElementText(container, '')
				mountChildren(c2, container, parentComponent)
			}
		}
	}

	function unmountChildren(children) {
		for (let i = 0; i < children.length; i++) {
			const el = children[i].el
			hostRemove(el)
		}
	}

	function patchProps(el, oldProps, newProps) {
		if (oldProps !== newProps) {
			for (const key in newProps) {
				const prevProp = oldProps[key]
				const nextProp = newProps[key]

				if (prevProp !== nextProp) {
					hostPatchProp(el, key, prevProp, nextProp)
				}
			}

			if (oldProps !== EMPTY_OBJ) {
				for (const key in oldProps) {
					if (!(key in newProps)) {
						hostPatchProp(el, key, oldProps[key], null)
					}
				}
			}
		}
	}

	function processComponent(n1, n2: any, container: any, parentComponent) {
		mountComponent(n2, container, parentComponent)
	}

	function mountElement(vnode: any, container, parentComponent) {
		const el = (vnode.el = hostCreateElement(vnode.type))

		const { children, shapeFlag } = vnode

		// children
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// text_children
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			// array_children
			mountChildren(vnode.children, el, parentComponent)
		}

		const { props } = vnode
		for (const key in props) {
			const val = props[key]

			// // on + Event name
			// const isOn = (key: string) => /^on[A-Z]/.test(key)
			// if (isOn(key)) {
			// 	const event = key.slice(2).toLocaleLowerCase()
			// 	el.addEventListener(event, val)
			// } else {
			// 	el.setAttribute(key, val)
			// }
			hostPatchProp(el, key, null, val)
		}

		// container.append(el)
		hostInsert(el, container)
	}

	function mountChildren(children, container, parentComponent) {
		children.forEach((v) => {
			patch(null, v, container, parentComponent)
		})
	}

	function mountComponent(initialVNode: any, container, parentComponent) {
		const instance = createComponentInstance(initialVNode, parentComponent)

		setupComponent(instance)
		setupRenderEffect(instance, initialVNode, container)
	}

	function setupRenderEffect(instance: any, initialVNode, container) {
		effect(() => {
			if (!instance.isMounted) {
				const { proxy } = instance
				const subTree = (instance.subTree = instance.render.call(proxy))

				patch(null, subTree, container, instance)

				initialVNode.el = subTree.el

				instance.isMounted = true
			} else {
				const { proxy } = instance
				const prevSubTree = instance.subTree
				const subTree = instance.render.call(proxy)

				// 更新subTree
				instance.subTree = subTree

				patch(prevSubTree, subTree, container, instance)
			}
		})
	}

	return { createApp: createAppAPI(render) }
}
