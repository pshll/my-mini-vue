import { createVNode } from './createVNode'
import { render } from './render'

export function createApp(rootComponent) {
	return {
		mount(rootContainer) {
			// 先转换 vnode
			// component -> vnode
			const vnode = createVNode(rootComponent)

			render(vnode, rootContainer)
		}
	}
}
