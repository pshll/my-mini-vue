import { extend } from '@my-mini-vue/shared'

export let activeEffect
export let shouldTrack = true

export class ReactiveEffect {
	deps = []
	active = true
	computed?
	onStop?: () => {}
	constructor(public fn, public scheduler: any = null) {}
	run() {
		if (!this.active) {
			return this.fn()
		}
		shouldTrack = true
		activeEffect = this
		const result = this.fn()

		shouldTrack = false

		return result
	}
	stop() {
		if (this.active) {
			cleanupEffect(this)
			if (this.onStop) {
				this.onStop()
			}
			this.active = false
		}
	}
}

function cleanupEffect(effect) {
	for (let i = 0; i < effect.deps.length; i++) {
		effect.deps[i].delete(effect)
	}
	effect.deps.length = 0
}

export function effect(fn, options?) {
	const _effect = new ReactiveEffect(fn)
	if (options) {
		// Object.assign(_effect, options)
		extend(_effect, options)
	}
	_effect.run()

	const runner: any = _effect.run.bind(_effect)

	runner.effect = _effect

	return runner
}

const targetMap = new Map()

export function track(target, key) {
	let depsMap = targetMap.get(target)
	if (!depsMap) {
		targetMap.set(target, (depsMap = new Map()))
	}
	let dep = depsMap.get(key)
	if (!dep) {
		depsMap.set(key, (dep = new Set()))
	}

	if (activeEffect && shouldTrack) {
		trackEffects(dep)
	}

	// dep.add(activeEffect)
	// activeEffect.deps.push(dep)

	// 问题是什么？ ==> 没有执行effect() 直接执行track()
	// effect里面做了些什么？ ==> 执行 `ReactiveEffect`的run 方法
	// run里面做了写什么？ ==> 将activeEffect赋值
	// 所以不执行effect()直接执行track() activeEffect未赋值
	// let shouldTrack = false
	// shouldTrack = !dep.has(activeEffect)
	// if (shouldTrack) {
	// 	dep.add(activeEffect)
	// 	activeEffect.deps.push(dep)
	// }
}

export function trackEffects(dep) {
	let shouldTrack = false
	shouldTrack = !dep.has(activeEffect)
	// if (dep.has(activeEffect)) return
	if (shouldTrack) {
		dep.add(activeEffect)
		activeEffect.deps.push(dep)
	}
}

export function trigger(target, key) {
	let depsMap = targetMap.get(target)
	let dep = depsMap.get(key)
	triggerEffects(dep)
}

export function triggerEffects(dep) {
	for (const effect of dep) {
		if (effect.compute) {
			triggerEffect(effect)
		}
	}
	for (const effect of dep) {
		if (!effect.compute) {
			triggerEffect(effect)
		}
	}
}

export function triggerEffect(effect) {
	if (effect.scheduler) {
		effect.scheduler()
	} else {
		effect.run()
	}
}

export function stop(runner) {
	runner.effect.stop()
}
