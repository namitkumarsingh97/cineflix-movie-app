import apiClient from "../plugins/axios";

export const videosApi = {
	// Get all videos
	getAll: (params = {}) => apiClient.get("/videos", { params }),

	// Get video by ID
	getById: (id) => apiClient.get(`/videos/${id}`),

	// Get videos by category with pagination/sorting
	getByCategory: (category, params = {}) =>
		apiClient.get("/videos", {
			params: {
				category,
				...params,
			},
		}),

	// Get paginated categories with counts/thumbnails
	getCategories: (params = {}) =>
		apiClient.get("/videos/categories", { params }),

	// Create video
	create: (data) => apiClient.post("/videos", data),

	// Update video
	update: (id, data) => apiClient.put(`/videos/${id}`, data),

	// Delete video
	delete: (id) => apiClient.delete(`/videos/${id}`),

	// Sync videos from S3
	sync: (prefix = "videos/") => apiClient.post("/videos/sync", { prefix }),
};
