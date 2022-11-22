import { createRenderer } from '../runtime-core'

function createElement(type) {
	return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
	const isOn = (key: string) => /^on[A-Z]/.test(key)
	if (isOn(key)) {
		// TODO bug -> effect触发时候 重复添加事件
		// 解决办法，el上存储之前event和event中的cb
		const invokers = el._vei || (el._vei = {})
		const existingInvoker = invokers[key]
		if (nextVal && existingInvoker) {
			// 非init
			existingInvoker.value = nextVal
		} else {
			// init
			const eventName = key.slice(2).toLocaleLowerCase()
			if (nextVal) {
				const invoker = (invokers[key] = nextVal)
				el.addEventListener(eventName, invoker)
			} else {
				// 更新时候需要删除绑定事件
				el.removeEventListener(eventName, existingInvoker)
				invokers[key] = undefined
			}
		}
	} else {
		if (nextVal === undefined || nextVal === null) {
			el.removeAttribute(key)
		} else {
			el.setAttribute(key, nextVal)
		}
	}
}

function insert(child, parent, anchor) {
	// parent.append(el)
	parent.insertBefore(child, anchor || null)
}

function remove(child) {
	const parent = child.parentNode
	if (parent) {
		parent.removeChild(child)
	}
}

function setElementText(el, text) {
	el.textContent = text
}

const renderer: any = createRenderer({
	createElement,
	patchProp,
	insert,
	remove,
	setElementText
})

export function createApp(...args) {
	return renderer.createApp(...args)
}

export * from '../runtime-core'
