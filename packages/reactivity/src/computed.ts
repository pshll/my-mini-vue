import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

class ComputedRefImpl {
	public dep?: any

	private _dirty: boolean = true
	private _value: any

	private readonly effect: ReactiveEffect
	constructor(getter) {
		this.dep = new Set()
		this.effect = new ReactiveEffect(getter, () => {
			if (!this._dirty) {
				this._dirty = true
				triggerRefValue(this)
			}
		})
		this.effect.computed = this
	}
	get value() {
		trackRefValue(this)
		if (this._dirty) {
			this._dirty = false
			this._value = this.effect.run()
		}

		return this._value
	}
}

export function computed(getter) {
	return new ComputedRefImpl(getter)
}
