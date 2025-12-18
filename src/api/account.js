import apiClient from "../plugins/axios";

/**
 * Account management API service
 */
export const accountApi = {
	/**
	 * Get user profile
	 */
	getProfile: async () => {
		try {
			const response = await apiClient.get("/account/profile");
			return response.data;
		} catch (error) {
			console.error("Error fetching profile:", error);
			throw error;
		}
	},

	/**
	 * Update user profile
	 */
	updateProfile: async (profileData) => {
		try {
			const response = await apiClient.put("/account/profile", profileData);
			return response.data;
		} catch (error) {
			console.error("Error updating profile:", error);
			throw error;
		}
	},

	/**
	 * Change password
	 */
	changePassword: async (passwordData) => {
		try {
			const response = await apiClient.post(
				"/account/change-password",
				passwordData,
			);
			return response.data;
		} catch (error) {
			console.error("Error changing password:", error);
			throw error;
		}
	},

	/**
	 * Delete account
	 */
	deleteAccount: async (password) => {
		try {
			const response = await apiClient.delete("/account", {
				data: { password },
			});
			return response.data;
		} catch (error) {
			console.error("Error deleting account:", error);
			throw error;
		}
	},

	/**
	 * Get account settings
	 */
	getSettings: async () => {
		try {
			const response = await apiClient.get("/account/settings");
			return response.data;
		} catch (error) {
			console.error("Error fetching settings:", error);
			throw error;
		}
	},

	/**
	 * Update account settings
	 */
	updateSettings: async (settings) => {
		try {
			const response = await apiClient.put("/account/settings", settings);
			return response.data;
		} catch (error) {
			console.error("Error updating settings:", error);
			throw error;
		}
	},
};
