import apiClient from '../plugins/axios';

export const videosApi = {
  // Get all videos
  getAll: () => apiClient.get('/videos'),
  
  // Get video by ID
  getById: (id) => apiClient.get(`/videos/${id}`),
  
  // Create video
  create: (data) => apiClient.post('/videos', data),
  
  // Update video
  update: (id, data) => apiClient.put(`/videos/${id}`, data),
  
  // Delete video
  delete: (id) => apiClient.delete(`/videos/${id}`),
  
  // Sync videos from S3
  sync: (prefix = 'videos/') => apiClient.post('/videos/sync', { prefix }),
};

