import { getCurrentInstance } from './component'

export function provide(key, value) {
	// 存
	// 数据存储在哪里? ==> instance中

	const currentInstance: any = getCurrentInstance()
	if (currentInstance) {
		let { provides } = currentInstance
		const parentProvides = currentInstance.parent.provides

		if (provides === parentProvides) {
			provides = currentInstance.provides = Object.create(parentProvides)
		}
		provides[key] = value
	}
}

export function inject(key, defalutValue) {
	// 取
	const currentInstance: any = getCurrentInstance()
	if (currentInstance) {
		const parentProvides = currentInstance.parent.provides
		if (key in parentProvides) {
			return parentProvides[key]
		} else if (defalutValue) {
			if (typeof defalutValue === 'function') {
				return defalutValue()
			}
			return defalutValue
		}
	}
}
