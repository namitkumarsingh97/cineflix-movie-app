import apiClient from '../plugins/axios';

/**
 * Subscription API service
 */
export const subscriptionApi = {
  /**
   * Get current subscription status
   */
  getStatus: async () => {
    try {
      const response = await apiClient.get('/subscription/status');
      return response.data;
    } catch (error) {
      // If user is not authenticated or endpoint doesn't exist, return null
      if (error.response?.status === 401 || error.response?.status === 404) {
        return { isPremium: false, subscription: null };
      }
      throw error;
    }
  },

  /**
   * Create a new subscription
   */
  createSubscription: async (subscriptionData) => {
    try {
      const response = await apiClient.post('/subscription/create', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  /**
   * Cancel current subscription
   */
  cancelSubscription: async () => {
    try {
      const response = await apiClient.post('/subscription/cancel');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  /**
   * Get subscription history
   */
  getHistory: async () => {
    try {
      const response = await apiClient.get('/subscription/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  },

  /**
   * Confirm payment and create subscription
   */
  confirmPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/subscription/confirm-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Create UPI payment order
   */
  createUPIOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/subscription/create-upi-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating UPI order:', error);
      throw error;
    }
  },

  /**
   * Verify UPI payment
   */
  verifyUPIPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/subscription/verify-upi-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying UPI payment:', error);
      throw error;
    }
  },
};

