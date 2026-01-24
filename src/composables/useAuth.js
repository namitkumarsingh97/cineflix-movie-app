import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../api/auth';
import apiClient from '../plugins/axios';

const TOKEN_KEY = 'cineflix_auth_token';
const USER_KEY = 'cineflix_user';

/**
 * Authentication composable
 */
export function useAuth() {
  const router = useRouter();
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Initialize auth state from localStorage
   */
  function init() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    
    if (token && userData) {
      try {
        user.value = JSON.parse(userData);
        // Set token in axios defaults
        setAuthToken(token);
        // Verify token is still valid
        checkAuth();
      } catch (err) {
        console.error('Error parsing user data:', err);
        clearAuth();
      }
    }
  }

  /**
   * Set auth token in axios
   */
  function setAuthToken(token) {
    if (apiClient && apiClient.defaults) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Clear auth token from axios
   */
  function clearAuthToken() {
    if (apiClient && apiClient.defaults) {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Check if user is authenticated - DISABLED: Auth disabled, using Eporner API directly
   */
  async function checkAuth() {
    // Auth disabled - always return false, no API call
        return false;
    // try {
    //   const response = await authApi.getCurrentUser();
    //   // Backend returns { success: true, user: {...} }
    //   if (response && response.user) {
    //     user.value = response.user;
    //     localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    //     return true;
    //   } else {
    //     clearAuth();
    //     return false;
    //   }
    // } catch (err) {
    //   clearAuth();
    //   return false;
    // }
  }

  /**
   * Register new user
   */
  async function register(userData) {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authApi.register(userData);
      
      if (response.token && response.user) {
        user.value = response.user;
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setAuthToken(response.token);
        return { success: true, user: response.user };
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Login user
   */
  async function login(credentials) {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authApi.login(credentials);
      
      if (response.token && response.user) {
        user.value = response.user;
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setAuthToken(response.token);
        return { success: true, user: response.user };
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Google OAuth login
   */
  async function loginWithGoogle() {
    try {
      loading.value = true;
      error.value = null;

      // Check if Google library is loaded
      if (typeof window.google === 'undefined' || !window.google.accounts) {
        throw new Error('Google Sign-In library not loaded. Please refresh the page.');
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      return new Promise((resolve, reject) => {
        // Use OAuth 2.0 token client for more reliable popup flow
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            try {
              if (tokenResponse.error) {
                error.value = tokenResponse.error;
                loading.value = false;
                reject(new Error(tokenResponse.error));
                return;
              }

              // Get user info from Google using access token
              const userInfoResponse = await fetch(
                `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
              );
              
              if (!userInfoResponse.ok) {
                throw new Error('Failed to get user info from Google');
              }

              const userInfo = await userInfoResponse.json();
              
              // Send to backend for verification and JWT generation
              const result = await authApi.googleLogin(tokenResponse.access_token);
              
              if (result.token && result.user) {
                user.value = result.user;
                localStorage.setItem(TOKEN_KEY, result.token);
                localStorage.setItem(USER_KEY, JSON.stringify(result.user));
                setAuthToken(result.token);
                resolve({ success: true, user: result.user });
              } else {
                reject(new Error('Invalid response from server'));
              }
            } catch (err) {
              console.error('Google login error:', err);
              error.value = err.response?.data?.message || err.message || 'Google login failed';
              reject(err);
            } finally {
              loading.value = false;
            }
          },
        });

        // Request access token (this will open popup)
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err) {
      console.error('Google login setup error:', err);
      error.value = err.message || 'Google login failed';
      loading.value = false;
      return { success: false, error: error.value };
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      clearAuth();
      router.push('/');
    }
  }

  /**
   * Clear auth data
   */
  function clearAuth() {
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthToken();
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => {
    return user.value !== null;
  });

  return {
    user: computed(() => user.value),
    isAuthenticated,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    init,
    register,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
    clearAuth,
  };
}

