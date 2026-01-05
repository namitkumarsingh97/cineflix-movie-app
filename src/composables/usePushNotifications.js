import { onMounted, ref } from "vue";
import { userApi } from "../api/user";

const isLoggedIn = () => {
	return !!(
		localStorage.getItem("token") || localStorage.getItem("adminToken")
	);
};

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

export function usePushNotifications() {
	const isSupported = ref(
		"serviceWorker" in navigator && "PushManager" in window,
	);
	const subscription = ref(null);
	const permission = ref(Notification.permission || "default");

	const requestPermission = async () => {
		if (!isSupported.value) {
			console.warn("Push notifications not supported");
			return false;
		}

		try {
			const result = await Notification.requestPermission();
			permission.value = result;
			return result === "granted";
		} catch (err) {
			console.error("Error requesting notification permission:", err);
			return false;
		}
	};

	const subscribe = async () => {
		if (!isSupported.value || !isLoggedIn()) {
			return null;
		}

		try {
			const registration = await navigator.serviceWorker.ready;

			if (!VAPID_PUBLIC_KEY) {
				console.warn("VAPID public key not configured");
				return null;
			}

			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
			});

			subscription.value = {
				endpoint: sub.endpoint,
				keys: {
					p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
					auth: arrayBufferToBase64(sub.getKey("auth")),
				},
			};

			// Save to backend
			try {
				await userApi.savePushSubscription(subscription.value);
			} catch (err) {
				console.warn("Failed to save push subscription:", err);
			}

			return subscription.value;
		} catch (err) {
			console.error("Error subscribing to push notifications:", err);
			return null;
		}
	};

	const unsubscribe = async () => {
		if (!subscription.value) return;

		try {
			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.getSubscription();

			if (sub) {
				await sub.unsubscribe();
			}

			subscription.value = null;
		} catch (err) {
			console.error("Error unsubscribing from push notifications:", err);
		}
	};

	const initialize = async () => {
		if (!isSupported.value || !isLoggedIn()) return;

		try {
			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.getSubscription();

			if (sub) {
				subscription.value = {
					endpoint: sub.endpoint,
					keys: {
						p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
						auth: arrayBufferToBase64(sub.getKey("auth")),
					},
				};
			}
		} catch (err) {
			console.warn("Error initializing push notifications:", err);
		}
	};

	// Helper functions
	const urlBase64ToUint8Array = (base64String) => {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	};

	const arrayBufferToBase64 = (buffer) => {
		const bytes = new Uint8Array(buffer);
		let binary = "";
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	};

	onMounted(() => {
		if (isSupported.value && isLoggedIn()) {
			initialize();
		}
	});

	return {
		isSupported,
		subscription,
		permission,
		requestPermission,
		subscribe,
		unsubscribe,
		initialize,
	};
}
