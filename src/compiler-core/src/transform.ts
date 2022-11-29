import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

export function transform(root, options = {}) {
	const context = createTransformContext(root, options)
	// 1. 遍历 - 深度优先DFS
	traverseNode(root, context)

	createRootCodegen(root)

	root.helpers = new Set([...context.helpers.keys()])
}

function createRootCodegen(root: any) {
	const child = root.children[0]
	if (child.type === NodeTypes.ELEMENT) {
		root.codegenNode = child.codegenNode
	} else {
		root.codegenNode = root.children[0]
	}
}

function createTransformContext(root: any, options: any) {
	const context = {
		root,
		nodeTransforms: options.nodeTransforms || [],
		helpers: new Map(),
		helper(name) {
			const count = context.helpers.get(name) || 0
			context.helpers.set(name, count)
			return name
		}
	}
	return context
}

function traverseNode(node: any, context) {
	const nodeTransforms = context.nodeTransforms
	const exitFns: any = []
	for (let i = 0; i < nodeTransforms.length; i++) {
		const transform = nodeTransforms[i]
		const onExit = transform(node, context)
		if (onExit) exitFns.push(onExit)
	}

	switch (node.type) {
		case NodeTypes.INTERPOLATION:
			context.helper(TO_DISPLAY_STRING)
			break
		case NodeTypes.ROOT:
		case NodeTypes.ELEMENT:
			traverseChildren(node, context)
			break

		default:
			break
	}

	let i = exitFns.length
	while(i--) {
		exitFns[i]()
	}
}

function traverseChildren(node, context) {
	const children = node.children
	if (children) {
		for (let i = 0; i < children.length; i++) {
			traverseNode(children[i], context)
		}
	}
}
