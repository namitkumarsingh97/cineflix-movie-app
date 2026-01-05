import apiClient from "../plugins/axios";

export const userApi = {
	// Watch later
	getWatchLater: () => apiClient.get("/user/watch-later"),
	addWatchLater: (data) => apiClient.post("/user/watch-later", data),
	removeWatchLater: (data) => apiClient.delete("/user/watch-later", { data }),

	// Star follows
	getFollowedStars: () => apiClient.get("/user/stars"),
	followStar: (star) => apiClient.post("/user/stars/follow", { star }),
	unfollowStar: (star) => apiClient.post("/user/stars/unfollow", { star }),

	// Push notifications
	savePushSubscription: (subscription) =>
		apiClient.post("/user/push-subscription", { subscription }),

	// Notification counts
	getNotificationCounts: () => apiClient.get("/user/notifications/counts"),
};
