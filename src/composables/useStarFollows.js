import { onMounted, ref } from "vue";
import { userApi } from "../api/user";

const STORAGE_KEY = "cineflix_favorite_stars";

const isLoggedIn = () => {
	return !!(
		localStorage.getItem("token") || localStorage.getItem("adminToken")
	);
};

const loadStars = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch (err) {
		console.warn("Failed to load favorite stars", err);
		return [];
	}
};

const persistStars = (stars) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stars));
	} catch (err) {
		console.warn("Failed to persist favorite stars", err);
	}
};

const loadFromBackend = async () => {
	if (!isLoggedIn()) return loadStars();

	try {
		const response = await userApi.getFollowedStars();
		if (response.data?.success && response.data.data) {
			return response.data.data;
		}
	} catch (err) {
		console.warn("Failed to load followed stars from backend:", err);
	}

	return loadStars();
};

export function useStarFollows() {
	const stars = ref(loadStars());
	const syncing = ref(false);

	const sync = async () => {
		if (!isLoggedIn()) return;

		syncing.value = true;
		try {
			const backendStars = await loadFromBackend();
			if (backendStars.length > 0) {
				// Merge with local stars
				const merged = [...new Set([...stars.value, ...backendStars])];
				stars.value = merged;
				persistStars(stars.value);
			}
		} catch (err) {
			console.warn("Failed to sync followed stars:", err);
		} finally {
			syncing.value = false;
		}
	};

	const follow = async (name) => {
		if (!name) return;
		if (stars.value.includes(name)) return;

		stars.value = [...stars.value, name];
		persistStars(stars.value);

		// Sync to backend if logged in
		if (isLoggedIn()) {
			try {
				await userApi.followStar(name);
			} catch (err) {
				console.warn("Failed to sync follow to backend:", err);
			}
		}
	};

	const unfollow = async (name) => {
		stars.value = stars.value.filter((s) => s !== name);
		persistStars(stars.value);

		// Sync to backend if logged in
		if (isLoggedIn()) {
			try {
				await userApi.unfollowStar(name);
			} catch (err) {
				console.warn("Failed to sync unfollow to backend:", err);
			}
		}
	};

	const isFollowed = (name) => stars.value.includes(name);

	const clearFollows = async () => {
		const starsToRemove = [...stars.value];
		stars.value = [];
		persistStars(stars.value);

		// Sync to backend if logged in
		if (isLoggedIn()) {
			try {
				for (const star of starsToRemove) {
					await userApi.unfollowStar(star);
				}
			} catch (err) {
				console.warn("Failed to sync clear follows to backend:", err);
			}
		}
	};

	// Sync on mount if logged in
	onMounted(() => {
		if (isLoggedIn()) {
			sync();
		}
	});

	return {
		stars,
		syncing,
		follow,
		unfollow,
		isFollowed,
		clearFollows,
		sync,
	};
}
