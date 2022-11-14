import { computed } from '../computed'
import { effect } from '../effect'
import { reactive } from '../reactive'

describe('computed', () => {
	it('happy path', () => {
		const user = reactive({
			age: 1
		})
		const age = computed(() => {
			return user.age
		})
		expect(age.value).toBe(1)
	})

	it('should return updated value', () => {
		const value = reactive({})
		const cValue = computed(() => value.foo)
		expect(cValue.value).toBe(undefined)
		value.foo = 1
		expect(cValue.value).toBe(1)
	})

	it('should compute lazily', () => {
		const value = reactive({
			foo: 1
		})
		const getter = jest.fn(() => value.foo)
		const cValue = computed(getter)
		// lazy
		expect(getter).not.toHaveBeenCalled()

		expect(cValue.value).toBe(1)
		expect(getter).toHaveBeenCalledTimes(1)

		// should not compute again
		cValue.value
		expect(getter).toHaveBeenCalledTimes(1)

		// should not compute until needed
		value.foo = 2
		expect(getter).toHaveBeenCalledTimes(1)

		// now it should compute
		expect(cValue.value).toBe(2)
		expect(getter).toHaveBeenCalledTimes(2)

		// should not compute again
		cValue.value
		expect(getter).toHaveBeenCalledTimes(2)
	})

	it('should trigger effect', () => {
		const value = reactive({})
		const cValue = computed(() => value.foo)
		let dummy
		effect(() => {
			dummy = cValue.value
		})
		expect(dummy).toBe(undefined)
		value.foo = 1
		expect(dummy).toBe(1)
	})
})
