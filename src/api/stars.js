import apiClient from '../plugins/axios';

export const starsApi = {
  // Get star profile by name
  getProfile: (name) => apiClient.get(`/stars/${encodeURIComponent(name)}`),
  
  // Update star profile
  updateProfile: (name, data) => {
    if (data.photoFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('photo', data.photoFile);
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.birthDate !== undefined) formData.append('birthDate', data.birthDate);
      if (data.nationality !== undefined) formData.append('nationality', data.nationality);
      
      return apiClient.put(`/stars/${encodeURIComponent(name)}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Use JSON for URL or text updates
      return apiClient.put(`/stars/${encodeURIComponent(name)}`, data);
    }
  },
  
  // Increment star view count
  incrementView: (name) => apiClient.post(`/stars/${encodeURIComponent(name)}/view`),
};

