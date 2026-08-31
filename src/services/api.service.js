import axios from 'axios';
import CONFIG from './config.service';

const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 240000 ,
    headers: {
      Authorization: `Bearer ${CONFIG.TOKEN}`,
      'X-Entity': CONFIG.ENTITY_CLIENT,
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message =
        error.response?.data?.message || error.message || 'Error de conexión';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

export const apiClient = createApiClient(CONFIG.URL_API);
export const fileClient = createApiClient(CONFIG.URL_FILE);
