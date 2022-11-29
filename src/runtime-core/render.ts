import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { renderComponentRoot, shouldUpdateComponent } from './componentRenderUtils'
import { createAppAPI } from './createApp'
import { Fragment, normalizeVNode, Text } from './createVNode'
import { queueJobs } from './scheduler'

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
		remove: hostRemove,
		setElementText: hostSetElementText
	} = options

	function render(vnode, container) {
		patch(null, vnode, container, null, null)
	}

	/**
	 * @description:
	 * @param {*} n1 -> oldVnode
	 * @param {*} n2 -> newVnode
	 * @param {*} container
	 * @param {*} parentComponent
	 * @return {*}
	 */
	function patch(n1, n2, container, parentComponent, anchor) {
		// ShapeFlags
		// vnode -> flag
		// 处理组件
		const { type, shapeFlag } = n2

		// Fragment -> 只渲染children
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent, anchor)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent, anchor)
					// STATEFUL_COMPONENT
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent, anchor)
				}
				break
		}
	}

	function processText(n1: any, n2: any, container: any) {
		const { children } = n2
		const textNode = (n2.el = document.createTextNode(children))
		container.append(textNode)
	}
	function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
		mountChildren(n2.children, container, parentComponent, anchor)
	}

	function processElement(n1, n2: any, container: any, parentComponent, anchor) {
		// init
		if (!n1) {
			mountElement(n2, container, parentComponent, anchor)
		} else {
			patchElement(n1, n2, container, parentComponent, anchor)
		}
	}

	function patchElement(n1, n2, container, parentComponent, anchor) {
		const oldProps = n1.props || EMPTY_OBJ
		const newProps = n2.props || EMPTY_OBJ

		const el = (n2.el = n1.el)

		patchChildren(n1, n2, el, parentComponent, anchor)
		patchProps(el, oldProps, newProps)
	}

	function patchChildren(n1, n2, container, parentComponent, anchor) {
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
				mountChildren(c2, container, parentComponent, anchor)
			}

			// diff 双端对比diff算法
			patchKeyedChildren(c1, c2, container, parentComponent, anchor)
		}
	}

	function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
		let i = 0
		const l2 = c2.length
		let e1 = c1.length - 1
		let e2 = l2 - 1

		function isSameVNodeType(n1, n2) {
			// type key
			return n1.type === n2.type && n1.key === n2.key
		}

		// 1. sync from start
		// (a b) c
		// (a b) d e
		while (i <= e1 && i <= e2) {
			const n1 = c1[i]
			const n2 = c2[i]
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
			} else {
				break
			}
			i++
		}

		// 2. sync from end
		// a (b c)
		// d e (b c)
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1]
			const n2 = c2[e2]
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
			} else {
				break
			}
			e1--
			e2--
		}

		// 3. common sequence + mount
		// (a b)
		// (a b) c
		// i = 2, e1 = 1, e2 = 2
		// (a b)
		// c (a b)
		// i = 0, e1 = -1, e2 = 0
		if (i > e1) {
			if (i <= e2) {
				const nextPos = e2 + 1
				const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
				patch(null, c2[i], container, parentComponent, anchor)
			}
		}

		// 4. common sequence + unmount
		// (a b) c
		// (a b)
		// i = 2, e1 = 2, e2 = 1
		// a d (b c)
		// (b c)
		// i = 0, e1 = 1, e2 = -1
		else if (i > e2) {
			while (i <= e1) {
				hostRemove(c1[i].el)
				i++
			}
		}

		// 5. unknown sequence
		// [i ... e1 + 1]: a b [c d] f g
		// [i ... e2 + 1]: a b [e c] f g
		// i = 2, e1 = 3, e2 = 3
		// [i ... e1 + 1]: a b [c d e] f g
		// [i ... e2 + 1]: a b [e d c h] f g
		// i = 2, e1 = 4, e2 = 5
		else {
			const s1 = i
			const s2 = i

			// 5.1 build key:index map for newChildren
			const keyToNewIndexMap = new Map()
			for (i = s2; i <= e2; i++) {
				const nextChild = c2[i]
				if (nextChild.key) {
					keyToNewIndexMap.set(nextChild.key, i)
				}
			}

			let j
			// 当前处理了的数量
			let patched = 0
			// 新节点的数量
			const toBePatched = e2 - s2 + 1

			let moved = false
			// used to track whether any node has moved
			let maxNewIndexSoFar = 0
			// works as Map<newIndex, oldIndex>
			// Note that oldIndex is offset by +1
			// and oldIndex = 0 is a special value indicating the new node has
			// no corresponding old node.
			// used for determining longest stable subsequence
			const newIndexToOldIndexMap = new Array(toBePatched)
			for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

			for (i = s1; i <= e1; i++) {
				const prevChild = c1[i]

				if (patched >= toBePatched) {
					// all new children have been patched so this can only be a removal
					hostRemove(prevChild.el)
					continue
				}

				let newIndex
				if (prevChild.key != null) {
					newIndex = keyToNewIndexMap.get(prevChild.key)
				} else {
					// key-less node, try to locate a key-less node of the same type
					for (j = s2; j <= e2; j++) {
						if (
							newIndexToOldIndexMap[j - s2] === 0 &&
							isSameVNodeType(prevChild, c2[j])
						) {
							newIndex = j
							break
						}
					}
				}

				if (newIndex === undefined) {
					hostRemove(prevChild.el)
				} else {
					// 记录位置
					newIndexToOldIndexMap[newIndex - s2] = i + 1
					if (newIndex >= maxNewIndexSoFar) {
						maxNewIndexSoFar = newIndex
					} else {
						moved = true
					}
					patch(prevChild, c2[newIndex], container, parentComponent, null)
					patched++
				}
			}

			// 5.3 move and mount
			// 最长递增子序列
			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
			j = increasingNewIndexSequence.length - 1

			for (let i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = i + s2
				const nextChild = c2[nextIndex]
				const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor

				if (newIndexToOldIndexMap[i] === 0) {
					// mount new
					patch(null, nextChild, container, parentComponent, anchor)
				} else if (moved) {
					// move if:
					// There is no stable subsequence (e.g. a reverse)
					// OR current node is not among the stable sequence
					if (j < 0 || i !== increasingNewIndexSequence[j]) {
						hostInsert(nextChild.el, container, anchor)
					} else {
						j--
					}
				}
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

	function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
		if (!n1) {
			// init
			mountComponent(n2, container, parentComponent, anchor)
		} else {
			// updateComponent
			updateComponent(n1, n2)
		}
	}

	function updateComponent(n1, n2) {
		const instance = (n2.component = n1.component)
		if (shouldUpdateComponent(n1, n2)) {
			instance.next = n2

			instance.update()
		} else {
			n2.el = n1.el
			instance.vnode = n2
		}
	}

	function mountElement(vnode: any, container, parentComponent, anchor) {
		const el = (vnode.el = hostCreateElement(vnode.type))

		const { children, shapeFlag } = vnode

		// children
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// text_children
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			// array_children
			mountChildren(vnode.children, el, parentComponent, anchor)
		}

		const { props } = vnode
		for (const key in props) {
			const val = props[key]
			hostPatchProp(el, key, null, val)
		}
		hostInsert(el, container, anchor)
	}

	function mountChildren(children, container, parentComponent, anchor) {
		children.forEach((v) => {
			patch(null, v, container, parentComponent, anchor)
		})
	}

	function mountComponent(initialVNode: any, container, parentComponent, anchor) {
		// vnode 上 initialVNode.component => instance 用于组件更新
		const instance = (initialVNode.component = createComponentInstance(
			initialVNode,
			parentComponent
		))

		setupComponent(instance)
		setupRenderEffect(instance, initialVNode, container, anchor)
	}

	function setupRenderEffect(instance: any, initialVNode, container, anchor) {
		function componentUpdateFn() {
			if (!instance.isMounted) {
				const subTree: any = (instance.subTree = renderComponentRoot(instance))

				patch(null, subTree, container, instance, anchor)

				initialVNode.el = subTree.el

				instance.isMounted = true
			} else {
				// update
				const { next, vnode } = instance
				if (next) {
					next.el = vnode.el

					updateComponentPreRender(instance, next)
				}

				const prevSubTree = instance.subTree
				const subTree = (instance.subTree = renderComponentRoot(instance))

				patch(prevSubTree, subTree, container, instance, anchor)
			}
		}
		// instance.update
		const effectFn = (instance.effect = effect(componentUpdateFn, {
			scheduler: () => {
				// effect 推到微任务的时候再执行
				queueJobs(update)
			}
		}))
		const update: any = (instance.update = () => effectFn())
		update.id = instance.uid
	}

	function updateComponentPreRender(instance, nextVNode) {
		instance.vnode = nextVNode
		instance.next = null
		instance.props = nextVNode.props
	}

	return { createApp: createAppAPI(render) }
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
	const p = arr.slice()
	const result = [0]
	let i, j, u, v, c
	const len = arr.length
	for (i = 0; i < len; i++) {
		const arrI = arr[i]
		if (arrI !== 0) {
			j = result[result.length - 1]
			if (arr[j] < arrI) {
				p[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				c = (u + v) >> 1
				if (arr[result[c]] < arrI) {
					u = c + 1
				} else {
					v = c
				}
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1]
				}
				result[u] = i
			}
		}
	}
	u = result.length
	v = result[u - 1]
	while (u-- > 0) {
		result[u] = v
		v = p[v]
	}
	return result
}
