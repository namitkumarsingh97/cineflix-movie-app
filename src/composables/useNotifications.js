import { ref } from "vue";

const permissionState = ref(Notification?.permission ?? "default");

export function useNotifications() {
	const canNotify = () => permissionState.value === "granted";

	const requestPermission = async () => {
		if (typeof Notification === "undefined") return "denied";
		if (permissionState.value === "granted") return "granted";
		const result = await Notification.requestPermission();
		permissionState.value = result;
		return result;
	};

	const notify = async (title, options = {}) => {
		if (typeof Notification === "undefined") return;
		if (permissionState.value !== "granted") {
			const result = await requestPermission();
			if (result !== "granted") return;
		}
		try {
			return new Notification(title, {
				icon: "/icon-192.png",
				badge: "/icon-192.png",
				silent: false,
				...options,
			});
		} catch (err) {
			console.warn("Notification error", err);
		}
	};

	return {
		permission: permissionState,
		canNotify,
		requestPermission,
		notify,
	};
}
