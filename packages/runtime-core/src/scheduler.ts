const queue: any[] = []

const resolvedPromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

let isFlushPending = false
let isFlushing = false

let flushIndex = 0

export function nextTick(fn?) {
    // nextTick 只需要手动去执行下一个tick的方法即可
	const p = currentFlushPromise || resolvedPromise
	return fn ? p.then(fn) : p
}

export function queueJobs(job) {
	// 防止重新添加任务
	if (!queue.length || !queue.includes(job)) {
		if (job.id == null) {
			queue.push(job)
		} else {
			queue.splice(findInsertionIndex(job.id), 0, job)
		}
		// 执行队列中的job
		queueFlush()
	}
}

function queueFlush() {
	if (!isFlushPending) {
		isFlushPending = true
		// 以Promise的方式执行，即在下一个`tick`中执行
		currentFlushPromise = resolvedPromise.then(flushJobs)
	}
}

function findInsertionIndex(id: number) {
	// 二分查找
	let start = flushIndex + 1
	let end = queue.length

	while (start < end) {
		const middle = (start + end) >>> 1
		const middleJobId = getId(queue[middle])
		middleJobId < id ? (start = middle + 1) : (end = middle)
	}
	return start
}

function getId(job) {
	return job.id == null ? Infinity : job.id
}

function flushJobs() {
	// 执行队列中的jobs
	isFlushPending = false
	isFlushing = true

	queue.sort(comparator)

	try {
		for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
			const job = queue[flushIndex]
			if (job) {
				job()
			}
		}
	} finally {
		flushIndex = 0
		queue.length = 0
	}
}

function comparator(a, b): number {
	const diff = getId(a) - getId(b)
	return diff
}
