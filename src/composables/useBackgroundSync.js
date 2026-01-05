import { ref } from "vue";

/**
 * Composable for background sync functionality
 */
export function useBackgroundSync() {
	const isSupported = ref(false);
	const isRegistered = ref(false);

	// Check if background sync is supported
	const checkSupport = async () => {
		if (!("serviceWorker" in navigator) || !("sync" in self.registration)) {
			isSupported.value = false;
			return false;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			isSupported.value = true;
			return true;
		} catch (err) {
			isSupported.value = false;
			return false;
		}
	};

	// Register background sync
	const registerSync = async (tag) => {
		if (!isSupported.value) {
			await checkSupport();
		}

		if (!isSupported.value) {
			console.warn("Background sync not supported");
			return false;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			await registration.sync.register(tag);
			isRegistered.value = true;
			return true;
		} catch (err) {
			console.warn("Failed to register background sync:", err);
			return false;
		}
	};

	// Send message to service worker
	const sendMessageToSW = async (message) => {
		if (!("serviceWorker" in navigator)) {
			return false;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			if (registration.active) {
				registration.active.postMessage(message);
				return true;
			}
		} catch (err) {
			console.warn("Failed to send message to service worker:", err);
		}
		return false;
	};

	// Initialize
	checkSupport();

	return {
		isSupported,
		isRegistered,
		registerSync,
		sendMessageToSW,
		checkSupport,
	};
}
