import { hasChanged } from '../shared'
import { activeEffect, shouldTrack, trackEffects, triggerEffects } from './effect'
import { isReactive, toReactive } from './reactive'

class RefImpl {
	private _value: any
	public dep
	private _rawValue: any
	public readonly __v_isRef = true
	constructor(value, public readonly __v_isShallow: Boolean) {
		this._rawValue = value
		// this._value = is_shallow ? value : toReactive(value)
		this._value = toReactive(value)
		this.dep = new Set()
	}
	get value() {
		trackRefValue(this)
		// trackEffects(this.dep)
		return this._value
	}
	set value(newValue) {
		if (hasChanged(newValue, this._rawValue)) {
			this._rawValue = newValue
			this._value = toReactive(newValue)
			triggerRefValue(this)
		}
	}
}

export function ref(value) {
	return new RefImpl(value, false)
}

export function trackRefValue(ref) {
	if (shouldTrack && activeEffect) {
		trackEffects(ref.dep)
	}
}

export function triggerRefValue(ref, newVal?: any) {
	triggerEffects(ref.dep)
}

export function isRef(r) {
	return !!r.__v_isRef
}

export function unRef(r) {
	return isRef(r) ? r.value : r
}

const shallowUnwrapHandlers = {
	get: (target, key) => {
		return unRef(Reflect.get(target, key))
	},
	set: (target, key, value) => {
		const oldValue = target[key]
		if (isRef(oldValue) && !isRef(value)) {
			oldValue.value = value
			return true
		}
		return Reflect.set(target, key, value)
	}
}

export function proxyRefs(objectWithRefs) {
	return isReactive(objectWithRefs)
		? objectWithRefs
		: new Proxy(objectWithRefs, shallowUnwrapHandlers)
}
