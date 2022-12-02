import { createVNodeCall, NodeTypes } from '../ast'

export function transformElement(node, context) {
	if (node.type === NodeTypes.ELEMENT) {
		return () => {
			// 中间层处理
			// tag
			const vnodeTag = `'${node.tag}'`

			// props
			let vnodeProps

			const children = node.children
			let vnodeChildren = children[0]

			const vnodeElement = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren)

			node.codegenNode = vnodeElement
		}
	}
}
