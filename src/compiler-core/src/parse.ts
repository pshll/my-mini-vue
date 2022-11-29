import { NodeTypes } from './ast'

const enum TagType {
	Start,
	End
}

export function baseParse(content: string) {
	const context = createParseContext(content)

	return createRoot(parseChildren(context, []))
}

function createParseContext(content: string) {
	return {
		source: content
	}
}

function createRoot(children) {
	return {
		children,
		type: NodeTypes.ROOT
	}
}

function parseChildren(context, ancestors) {
	const nodes: any = []

	while (!isEnd(context, ancestors)) {
		const s = context.source

		let node

		if (startsWith(s, '{{')) {
			node = parseInterpolation(context)
		} else if (context.source[0] === '<') {
			if (/[a-z]/i.test(context.source[1])) {
				node = parseElement(context, ancestors)
			}
		}

		if (!node) {
			node = parseText(context)
		}

		nodes.push(node)
	}

	return nodes
}

function isEnd(context, ancestors) {
	const s = context.source
	// 结束标签
	if (s.startsWith('</')) {
		for (let i = ancestors.length - 1; i >= 0; i--) {
			if (startsWithEndTagOpen(s, ancestors[i].tag)) {
				return true
			}
		}
	}
	// source 有值
	return !s
}

function parseInterpolation(context) {
	//  {{ message }}

	const openDelimiter = '{{'
	const closeDelimiter = '}}'

	const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

	advanceBy(context, openDelimiter.length)

	const rawContentLength = closeIndex - openDelimiter.length
	const rawContent = parseTextData(context, rawContentLength)
	const content = rawContent.trim()

	advanceBy(context, closeDelimiter.length)

	return {
		type: NodeTypes.INTERPOLATION,
		// type: 'interpolation',
		content: {
			type: NodeTypes.SIMPLE_INTERPOLATION,
			content: content
		}
	}
}

function parseElement(context: any, ancestors) {
	const element: any = parseTag(context, TagType.Start)
	ancestors.push(element)
	element.children = parseChildren(context, ancestors)
	ancestors.pop()

	if (startsWithEndTagOpen(context.source, element.tag)) {
		parseTag(context, TagType.End)
	} else {
		throw new Error('lack end tag')
	}
	return element
}

function startsWithEndTagOpen(source, tag) {
	return (
		source.startsWith('</') &&
		source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
	)
}

function parseTag(context, type: TagType) {
	// 1. 解析tag
	const match: any = /^<\/?([a-z]*)/i.exec(context.source)
	const tag = match[1]
	// 2. 推进解析的代码
	advanceBy(context, match[0].length)
	advanceBy(context, 1)

	if (type === TagType.End) return

	return {
		type: NodeTypes.ELEMENT,
		tag
	}
}

function parseText(context: any) {
	let endIndex = context.source.length
	let endTokens = ['<', '{{']

	for (let i = 0; i < endTokens.length; i++) {
		const index = context.source.indexOf(endTokens[i])
		if (index !== -1 && endIndex > index) {
			endIndex = index
		}
	}

	const content = parseTextData(context, endIndex)

	return {
		type: NodeTypes.TEXT,
		content
	}
}

function advanceBy(context: any, length: number) {
	context.source = context.source.slice(length)
}

function startsWith(source: string, searchString: string): boolean {
	return source.startsWith(searchString)
}

function parseTextData(context: any, length: number) {
	const content = context.source.slice(0, length)

	advanceBy(context, length)

	return content
}
