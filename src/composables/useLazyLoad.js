import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Composable for lazy loading below-the-fold content
 */
export function useLazyLoad(options = {}) {
	const { rootMargin = "50px", threshold = 0.1, root = null } = options;

	const observer = ref(null);
	const observedElements = ref(new Set());

	// Setup Intersection Observer
	const setupObserver = () => {
		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			return null;
		}

		return new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const element = entry.target;
						const callback = element.dataset.lazyCallback;

						if (callback && window[callback]) {
							window[callback](element);
						} else if (element.dataset.lazySrc) {
							// Load image
							if (element.tagName === "IMG") {
								element.src = element.dataset.lazySrc;
								if (element.dataset.lazySrcset) {
									element.srcset = element.dataset.lazySrcset;
								}
							} else if (element.tagName === "VIDEO") {
								element.src = element.dataset.lazySrc;
							} else if (element.tagName === "IFRAME") {
								element.src = element.dataset.lazySrc;
							}

							// Remove blur effect when loaded
							element.addEventListener(
								"load",
								() => {
									element.style.filter = "none";
									element.style.opacity = "1";
								},
								{ once: true },
							);
						}

						// Unobserve after loading
						observer.value?.unobserve(element);
						observedElements.value.delete(element);
					}
				});
			},
			{
				rootMargin,
				threshold,
				root,
			},
		);
	};

	// Observe an element for lazy loading
	const observe = (element, src = null, srcset = null, callback = null) => {
		if (!element || !observer.value) return;

		// Store lazy loading data
		if (src) {
			element.dataset.lazySrc = src;
			if (srcset) {
				element.dataset.lazySrcset = srcset;
			}

			// Set placeholder/blur
			if (element.tagName === "IMG") {
				element.style.filter = "blur(10px)";
				element.style.opacity = "0.7";
				element.style.transition = "filter 0.3s, opacity 0.3s";
			}
		}

		if (callback) {
			const callbackId = `lazyCallback_${Date.now()}_${Math.random()}`;
			window[callbackId] = callback;
			element.dataset.lazyCallback = callbackId;
		}

		observer.value.observe(element);
		observedElements.value.add(element);
	};

	// Unobserve an element
	const unobserve = (element) => {
		if (!element || !observer.value) return;
		observer.value.unobserve(element);
		observedElements.value.delete(element);
	};

	// Check if element is in viewport (for immediate loading)
	const isInViewport = (element) => {
		if (!element) return false;
		const rect = element.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	onMounted(() => {
		observer.value = setupObserver();
	});

	onBeforeUnmount(() => {
		if (observer.value) {
			observedElements.value.forEach((element) => {
				observer.value.unobserve(element);
			});
			observedElements.value.clear();
			observer.value.disconnect();
		}
	});

	return {
		observe,
		unobserve,
		isInViewport,
	};
}
