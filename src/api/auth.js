import apiClient from "../plugins/axios";

/**
 * Authentication API service
 */
export const authApi = {
	/**
	 * Register a new user
	 */
	register: async (userData) => {
		try {
			const response = await apiClient.post("/auth/register", userData);
			return response.data;
		} catch (error) {
			console.error("Error registering user:", error);
			throw error;
		}
	},

	/**
	 * Login user
	 */
	login: async (credentials) => {
		try {
			const response = await apiClient.post("/auth/login", credentials);
			return response.data;
		} catch (error) {
			console.error("Error logging in:", error);
			throw error;
		}
	},

	/**
	 * Google OAuth login
	 */
	googleLogin: async (token) => {
		try {
			const response = await apiClient.post("/auth/google", { token });
			return response.data;
		} catch (error) {
			console.error("Error with Google login:", error);
			throw error;
		}
	},

	/**
	 * Logout user
	 */
	logout: async () => {
		try {
			const response = await apiClient.post("/auth/logout");
			return response.data;
		} catch (error) {
			console.error("Error logging out:", error);
			throw error;
		}
	},

	/**
	 * Get current user
	 */
	getCurrentUser: async () => {
		try {
			const response = await apiClient.get("/auth/me");
			return response.data;
		} catch (error) {
			if (error.response?.status === 401) {
				return null;
			}
			throw error;
		}
	},
};
