import { computed, ref } from "vue";
import { useGuestSession } from "./useGuestSession";

const WATCH_HISTORY_KEY = "watchHistory";
const FAVORITES_KEY = "favorites";
const MAX_HISTORY_ITEMS = 50;

// Watch History Functions
export function useWatchHistory() {
	const { getGuestSessionId, updateLastActivity, isGuest } = useGuestSession();

	const getWatchHistory = () => {
		try {
			// Ensure guest session exists
			if (isGuest()) {
				getGuestSessionId();
				updateLastActivity();
			}

			const history = localStorage.getItem(WATCH_HISTORY_KEY);
			return history ? JSON.parse(history) : [];
		} catch (error) {
			console.error("Error reading watch history:", error);
			return [];
		}
	};

	const addToHistory = (item) => {
		try {
			// Ensure guest session exists and update activity
			if (isGuest()) {
				getGuestSessionId();
				updateLastActivity();
			}

			const history = getWatchHistory();
			const { id, title, thumbnail, type, category } = item;

			// Remove if already exists
			const filtered = history.filter((h) => h.id !== id);

			// Add to beginning
			const newItem = {
				id,
				title,
				thumbnail,
				type, // 'movie' or 'video'
				category,
				watchedAt: new Date().toISOString(),
				progress: 0, // 0-100 percentage
				duration: item.duration || 0,
				sessionId: isGuest() ? getGuestSessionId() : null, // Track which session added this
			};

			filtered.unshift(newItem);

			// Keep only last MAX_HISTORY_ITEMS
			const limited = filtered.slice(0, MAX_HISTORY_ITEMS);

			localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(limited));
			return limited;
		} catch (error) {
			console.error("Error adding to watch history:", error);
			return [];
		}
	};

	const updateProgress = (id, progress, duration) => {
		try {
			const history = getWatchHistory();
			const item = history.find((h) => h.id === id);
			if (item) {
				item.progress = progress;
				item.duration = duration;
				item.watchedAt = new Date().toISOString();
				localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
			}
		} catch (error) {
			console.error("Error updating progress:", error);
		}
	};

	const removeFromHistory = (id) => {
		try {
			const history = getWatchHistory();
			const filtered = history.filter((h) => h.id !== id);
			localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered));
			return filtered;
		} catch (error) {
			console.error("Error removing from history:", error);
			return [];
		}
	};

	const clearHistory = () => {
		try {
			localStorage.removeItem(WATCH_HISTORY_KEY);
			return [];
		} catch (error) {
			console.error("Error clearing history:", error);
			return [];
		}
	};

	const getContinueWatching = () => {
		const history = getWatchHistory();
		// Return items with progress > 0 and < 90%
		return history
			.filter((h) => h.progress > 0 && h.progress < 90)
			.slice(0, 10);
	};

	return {
		getWatchHistory,
		addToHistory,
		updateProgress,
		removeFromHistory,
		clearHistory,
		getContinueWatching,
	};
}

// Favorites Functions
export function useFavorites() {
	const { getGuestSessionId, updateLastActivity, isGuest } = useGuestSession();

	const getFavorites = () => {
		try {
			// Ensure guest session exists
			if (isGuest()) {
				getGuestSessionId();
				updateLastActivity();
			}

			const favorites = localStorage.getItem(FAVORITES_KEY);
			return favorites ? JSON.parse(favorites) : [];
		} catch (error) {
			console.error("Error reading favorites:", error);
			return [];
		}
	};

	const addToFavorites = (item) => {
		try {
			// Ensure guest session exists and update activity
			if (isGuest()) {
				getGuestSessionId();
				updateLastActivity();
			}

			const favorites = getFavorites();
			const { id, title, thumbnail, type, category } = item;

			// Check if already favorited
			if (favorites.find((f) => f.id === id)) {
				return favorites;
			}

			const newItem = {
				id,
				title,
				thumbnail,
				type,
				category,
				favoritedAt: new Date().toISOString(),
				sessionId: isGuest() ? getGuestSessionId() : null, // Track which session added this
			};

			favorites.unshift(newItem);
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
			return favorites;
		} catch (error) {
			console.error("Error adding to favorites:", error);
			return [];
		}
	};

	const removeFromFavorites = (id) => {
		try {
			const favorites = getFavorites();
			const filtered = favorites.filter((f) => f.id !== id);
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
			return filtered;
		} catch (error) {
			console.error("Error removing from favorites:", error);
			return [];
		}
	};

	const isFavorited = (id) => {
		const favorites = getFavorites();
		return favorites.some((f) => f.id === id);
	};

	const toggleFavorite = (item) => {
		if (isFavorited(item.id || item._id)) {
			return removeFromFavorites(item.id || item._id);
		} else {
			return addToFavorites(item);
		}
	};

	return {
		getFavorites,
		addToFavorites,
		removeFromFavorites,
		isFavorited,
		toggleFavorite,
	};
}
