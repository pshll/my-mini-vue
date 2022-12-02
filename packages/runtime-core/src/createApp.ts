import { createVNode } from './createVNode'

export function createAppAPI(render) {
	return function createApp(rootComponent) {
		return {
			mount(rootContainer) {
				// 先转换 vnode
				// component -> vnode
				const vnode = createVNode(rootComponent)

				render(vnode, rootContainer)
			}
		}
	}
}
