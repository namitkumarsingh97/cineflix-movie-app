import { computed, onMounted, ref, watch } from "vue";
import { userApi } from "../api/user";
import { useStarFollows } from "./useStarFollows";
import { useWatchLater } from "./useWatchLater";

const isLoggedIn = () => {
	return !!(
		localStorage.getItem("token") || localStorage.getItem("adminToken")
	);
};

export function useBadgeCounts() {
	const { items: watchLaterItems } = useWatchLater();
	const { stars: followedStars } = useStarFollows();

	const backendCounts = ref({
		watchLater: 0,
		followedStarsUpdates: 0,
		total: 0,
	});

	const loading = ref(false);

	const watchLaterCount = computed(() => {
		if (isLoggedIn() && backendCounts.value.watchLater > 0) {
			return backendCounts.value.watchLater;
		}
		return watchLaterItems.value.length;
	});

	const followedStarsCount = computed(() => {
		return followedStars.value.length;
	});

	const totalCount = computed(() => {
		if (isLoggedIn()) {
			return (
				backendCounts.value.total ||
				watchLaterCount.value + followedStarsCount.value
			);
		}
		return watchLaterCount.value + followedStarsCount.value;
	});

	const fetchCounts = async () => {
		if (!isLoggedIn()) {
			backendCounts.value = {
				watchLater: watchLaterItems.value.length,
				followedStarsUpdates: 0,
				total: watchLaterItems.value.length,
			};
			return;
		}

		loading.value = true;
		try {
			const response = await userApi.getNotificationCounts();
			if (response.data?.success && response.data.data) {
				backendCounts.value = response.data.data;
			}
		} catch (err) {
			console.warn("Failed to fetch notification counts:", err);
			backendCounts.value = {
				watchLater: watchLaterItems.value.length,
				followedStarsUpdates: 0,
				total: watchLaterItems.value.length,
			};
		} finally {
			loading.value = false;
		}
	};

	// Watch for changes in watch later items
	watch(
		watchLaterItems,
		() => {
			if (!isLoggedIn()) {
				backendCounts.value.watchLater = watchLaterItems.value.length;
				backendCounts.value.total =
					watchLaterItems.value.length + followedStars.value.length;
			}
		},
		{ deep: true },
	);

	// Watch for changes in followed stars
	watch(
		followedStars,
		() => {
			if (!isLoggedIn()) {
				backendCounts.value.total =
					watchLaterItems.value.length + followedStars.value.length;
			}
		},
		{ deep: true },
	);

	onMounted(() => {
		fetchCounts();
		// Refresh counts every 5 minutes
		const interval = setInterval(fetchCounts, 5 * 60 * 1000);

		// Cleanup on unmount
		return () => clearInterval(interval);
	});

	return {
		watchLaterCount,
		followedStarsCount,
		totalCount,
		loading,
		fetchCounts,
	};
}
