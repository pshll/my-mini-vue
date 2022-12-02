import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'

describe('Parse', () => {
	describe('interpolation', () => {
		test('simple interpolation', () => {
			const ast = baseParse('{{ message }}')

			// root
			expect(ast.children[0]).toStrictEqual({
				type: NodeTypes.INTERPOLATION,
				content: {
					type: NodeTypes.SIMPLE_INTERPOLATION,
					content: 'message'
				}
			})
		})
	})

	describe('element', () => {
		test('simple element div', () => {
			const ast = baseParse('<div></div>')

			// root
			expect(ast.children[0]).toStrictEqual({
				type: NodeTypes.ELEMENT,
				tag: 'div',
				children: []
			})
		})
	})

	describe('text', () => {
		test('simple text', () => {
			const ast = baseParse('some text')

			// root
			expect(ast.children[0]).toStrictEqual({
				type: NodeTypes.TEXT,
				content: 'some text'
			})
		})
	})

	describe('hello world', () => {
		test('simple text', () => {
			const ast = baseParse('<p>hello world, {{ message }}</p>')

			expect(ast.children[0]).toStrictEqual({
				type: NodeTypes.ELEMENT,
				tag: 'p',
				children: [
					{
						type: NodeTypes.TEXT,
						content: 'hello world, '
					},
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_INTERPOLATION,
							content: 'message'
						}
					}
				]
			})
		})

		test('element with interpolation', () => {
			const ast = baseParse('<div>{{ msg }}</div>')
			const element = ast.children[0]

			expect(element).toStrictEqual({
				type: NodeTypes.ELEMENT,
				tag: 'div',
				children: [
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_INTERPOLATION,
							content: 'msg'
						}
					}
				]
			})
		})

		test('Nested element', () => {
			const ast = baseParse('<div><p>hi</p>{{ msg }}</div>')
			const element = ast.children[0]

			expect(element).toStrictEqual({
				type: NodeTypes.ELEMENT,
				tag: 'div',
				children: [
					{
						type: NodeTypes.ELEMENT,
						tag: 'p',
						children: [
							{
								type: NodeTypes.TEXT,
								content: 'hi'
							}
						]
					},
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_INTERPOLATION,
							content: 'msg'
						}
					}
				]
			})
		})

		test('should throw error when lack end tag', () => {
			expect(() => {
				baseParse('<div><span></div>')
			}).toThrow('lack end tag')
		})
	})
})
