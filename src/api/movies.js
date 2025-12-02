import apiClient from '../plugins/axios';

export const moviesApi = {
  // Get all movies
  getAll: () => apiClient.get('/movies'),
  
  // Get movie by ID
  getById: (id) => apiClient.get(`/movies/${id}`),
  
  // Create movie
  create: (data) => apiClient.post('/movies', data),
  
  // Update movie
  update: (id, data) => apiClient.put(`/movies/${id}`, data),
  
  // Delete movie
  delete: (id) => apiClient.delete(`/movies/${id}`),
};

