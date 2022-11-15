import { createVNode, Fragment } from '../createVNode'

export function renderSlot(slots, name, props) {
	let slot = slots[name]
	if (slot) {
		if (typeof slot === 'function') {
			return createVNode(Fragment, {}, slot(props))
		}
		// return createVNode('div', {}, slot)
	}
}
