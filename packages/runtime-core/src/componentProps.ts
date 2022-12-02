export function initProps(instance, rawProps) {
	// 将 props 给到 setup
	// setup -> instance.type
	instance.props = rawProps || {}

	// TODO attrs
}
