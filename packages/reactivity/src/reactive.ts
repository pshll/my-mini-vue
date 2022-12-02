import { isObject } from '@my-mini-vue/shared'
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'
// import { track, trigger } from './effect'

export const enum ReactiveFlags {
	IS_REACTIVE = '__v_is_reactive',
	IS_READONLY = '__v_is_readonly',
	IS_SHALLOW = '__v_is_shallow',
	RAW = '__v_raw'
}

function createReactiveObject(target: any, baseHandlers) {
	if (!isObject(target)) {
		return target
	}
	return new Proxy(target, baseHandlers)
}

export function reactive(target) {
	return createReactiveObject(target, mutableHandlers)
}

export function readonly(target) {
	return createReactiveObject(target, readonlyHandlers)
}

export function shallowReadonly(target) {
	return createReactiveObject(target, shallowReadonlyHandlers)
}

export function isReactive(value) {
	return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value) {
	return !!value[ReactiveFlags.IS_READONLY]
}

export function isShallow(value) {
	return !!value[ReactiveFlags.IS_SHALLOW]
}

export function isProxy(value) {
	return isReadonly(value) || isReactive(value)
}

export function toReactive(value) {
	return isObject(value) ? reactive(value) : value
}

export function toReadonly(value) {
	return isObject(value) ? readonly(value) : value
}

export function toRaw(observed) {
	const raw = observed && observed[ReactiveFlags.RAW]
	return raw ? toRaw(raw) : observed
}
