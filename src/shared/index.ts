export * from './toDisplayString'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export const NOOP = () => {}

export const isObject = (val) => {
	return val !== null && typeof val === 'object'
}

export const isString = (val) => {
	return typeof val === 'string'
}

export const hasChanged = (value: any, oldValue: any): Boolean => {
	return !Object.is(value, oldValue)
}

export const hasOwn = (val, key): Boolean => {
	return Object.prototype.hasOwnProperty.call(val, key)
}

// add -> Add
export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}
// add-foo => addFoo  父:onAddFoo
export const camelize = (str: string) => {
	return str.replace(/-(\w)/g, (_, c: string) => {
		return c ? c.toUpperCase() : ''
	})
}
export const toHandlerKey = (str: string) => {
	return str ? 'on' + capitalize(str) : ''
}
