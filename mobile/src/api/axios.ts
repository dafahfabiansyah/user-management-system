import axios from 'axios';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';

const API_URL = 'https://api.dafbians.my.id';

console.log('🔗 API URL:', API_URL);
console.log('🔗 Config API URL:', Config.API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'accessToken',
      });
      
      if (credentials) {
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    } catch (error) {
      console.error('❌ Error getting access token:', error);
    }
    
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('❌ Response Error:', error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    } else if (error.request) {
      console.log('❌ No response received:', error.request);
    }
    
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshTokenCredentials = await Keychain.getGenericPassword({
          service: 'refreshToken',
        });

        if (refreshTokenCredentials) {
          // Request new access token
          const response = await axios.post(
            `${API_URL}/api/auth/refresh`,
            {
              refreshToken: refreshTokenCredentials.password,
            }
          );

          const { accessToken } = response.data.data;

          // Save new access token
          await Keychain.setGenericPassword('accessToken', accessToken, {
            service: 'accessToken',
          });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ Refresh token failed:', refreshError);
        // Refresh failed, clear tokens and redirect to login
        await Keychain.resetGenericPassword({ service: 'accessToken' });
        await Keychain.resetGenericPassword({ service: 'refreshToken' });
        await Keychain.resetGenericPassword({ service: 'user' });
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
