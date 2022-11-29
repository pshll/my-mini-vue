import { normalizeVNode } from './createVNode'

export function shouldUpdateComponent(prevVNode, nextVNode) {
	// 只有props更新时 才更新组件
	const { props: prevProps } = prevVNode
	const { props: nextProps } = nextVNode

	if (prevProps === nextProps) {
		return false
	}
	if (!prevProps) {
		return !!nextProps
	}
	if (!nextProps) {
		return true
	}
	return hasPropsChanged(prevProps, nextProps)
}

function hasPropsChanged(prevProps, nextProps) {
	const nextKeys = Object.keys(nextProps)
	if (nextKeys.length !== Object.keys(prevProps).length) {
		return true
	}
	for (let i = 0; i < nextKeys.length; i++) {
		const key = nextKeys[i]
		if (nextProps[key] !== prevProps[key]) {
			return true
		}
	}
	return false
}

export function renderComponentRoot(instance) {
	let result
	const { proxy } = instance
	const proxyToUse = proxy
	result = normalizeVNode(instance.render.call(proxyToUse, proxyToUse))
	return result
}
