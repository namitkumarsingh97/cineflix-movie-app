import { computed, ref } from "vue";

/**
 * Guest Session Management
 * Handles data storage and session management for non-authenticated users
 * Uses localStorage with guest session IDs
 */
const GUEST_SESSION_KEY = "guestSessionId";
const GUEST_SESSION_DATA_KEY = "guestSessionData";
const SESSION_EXPIRY_DAYS = 30; // Guest sessions expire after 30 days

export function useGuestSession() {
	// Get or create guest session ID
	const getGuestSessionId = () => {
		try {
			let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

			if (!sessionId) {
				// Create new guest session ID
				sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				localStorage.setItem(GUEST_SESSION_KEY, sessionId);

				// Initialize session data
				const sessionData = {
					sessionId,
					createdAt: new Date().toISOString(),
					lastActivity: new Date().toISOString(),
					deviceInfo: getDeviceInfo(),
				};
				localStorage.setItem(
					GUEST_SESSION_DATA_KEY,
					JSON.stringify(sessionData),
				);
			} else {
				// Update last activity
				updateLastActivity();
			}

			return sessionId;
		} catch (error) {
			console.error("Error managing guest session:", error);
			return null;
		}
	};

	// Get device information
	const getDeviceInfo = () => {
		return {
			userAgent: navigator.userAgent,
			platform: navigator.platform,
			language: navigator.language,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	};

	// Update last activity timestamp
	const updateLastActivity = () => {
		try {
			const sessionDataStr = localStorage.getItem(GUEST_SESSION_DATA_KEY);
			if (sessionDataStr) {
				const sessionData = JSON.parse(sessionDataStr);
				sessionData.lastActivity = new Date().toISOString();
				localStorage.setItem(
					GUEST_SESSION_DATA_KEY,
					JSON.stringify(sessionData),
				);
			}
		} catch (error) {
			console.error("Error updating last activity:", error);
		}
	};

	// Check if session is expired
	const isSessionExpired = () => {
		try {
			const sessionDataStr = localStorage.getItem(GUEST_SESSION_DATA_KEY);
			if (!sessionDataStr) return true;

			const sessionData = JSON.parse(sessionDataStr);
			const lastActivity = new Date(sessionData.lastActivity);
			const daysSinceActivity =
				(Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

			return daysSinceActivity > SESSION_EXPIRY_DAYS;
		} catch (error) {
			return false;
		}
	};

	// Clear expired session data
	const clearExpiredSession = () => {
		try {
			if (isSessionExpired()) {
				localStorage.removeItem(GUEST_SESSION_KEY);
				localStorage.removeItem(GUEST_SESSION_DATA_KEY);
				// Clear all guest-related data
				localStorage.removeItem("watchHistory");
				localStorage.removeItem("favorites");
				localStorage.removeItem("watchLater");
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error clearing expired session:", error);
			return false;
		}
	};

	// Get session info
	const getSessionInfo = () => {
		try {
			const sessionId = getGuestSessionId();
			const sessionDataStr = localStorage.getItem(GUEST_SESSION_DATA_KEY);

			if (sessionDataStr) {
				const sessionData = JSON.parse(sessionDataStr);
				return {
					sessionId,
					createdAt: sessionData.createdAt,
					lastActivity: sessionData.lastActivity,
					deviceInfo: sessionData.deviceInfo,
					isExpired: isSessionExpired(),
				};
			}

			return {
				sessionId,
				createdAt: new Date().toISOString(),
				lastActivity: new Date().toISOString(),
				deviceInfo: getDeviceInfo(),
				isExpired: false,
			};
		} catch (error) {
			console.error("Error getting session info:", error);
			return null;
		}
	};

	// Migrate guest data to user account (when user signs up/logs in)
	const migrateGuestDataToAccount = async (userId) => {
		try {
			// This would be called when user signs up or logs in
			// Data would be sent to backend to merge with user account
			const watchHistory = localStorage.getItem("watchHistory");
			const favorites = localStorage.getItem("favorites");
			const watchLater = localStorage.getItem("watchLater");

			// Return data to be sent to backend
			return {
				userId,
				watchHistory: watchHistory ? JSON.parse(watchHistory) : [],
				favorites: favorites ? JSON.parse(favorites) : [],
				watchLater: watchLater ? JSON.parse(watchLater) : [],
				sessionId: getGuestSessionId(),
			};
		} catch (error) {
			console.error("Error migrating guest data:", error);
			return null;
		}
	};

	// Check if user is guest (not authenticated)
	const isGuest = () => {
		// Check if user is authenticated (this would check your auth system)
		// For now, we'll assume if there's no auth token, user is guest
		const authToken =
			localStorage.getItem("authToken") ||
			localStorage.getItem("token") ||
			sessionStorage.getItem("authToken");
		return !authToken;
	};

	return {
		getGuestSessionId,
		getSessionInfo,
		updateLastActivity,
		isSessionExpired,
		clearExpiredSession,
		migrateGuestDataToAccount,
		isGuest,
	};
}
