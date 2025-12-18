import apiClient from "../plugins/axios";

export const moviesApi = {
	// Get all movies
	getAll: (config = {}) => apiClient.get("/movies", config),

	// Get movie by ID
	getById: (id) => apiClient.get(`/movies/${id}`),

	// Create movie
	create: (data) => apiClient.post("/movies", data),

	// Update movie
	update: (id, data) => apiClient.put(`/movies/${id}`, data),

	// Delete movie
	delete: (id) => apiClient.delete(`/movies/${id}`),

	// Like movie
	like: (id) => apiClient.post(`/movies/${id}/like`),

	// Dislike movie
	dislike: (id) => apiClient.post(`/movies/${id}/dislike`),

	// Increment view
	incrementView: (id) => apiClient.post(`/movies/${id}/view`),

	// Add comment
	addComment: (id, data) => apiClient.post(`/movies/${id}/comments`, data),

	// Get comments
	getComments: (id) => apiClient.get(`/movies/${id}/comments`),

	// Get categories
	getCategories: () => apiClient.get("/movies/categories"),

	// Get stars/actors
	getStars: () => apiClient.get("/movies/stars"),
};
