import { axiosInstance } from "./axios-instance";

export const apiClient = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => {
    if (data instanceof FormData) {
      return axiosInstance.post(url, data, {
        ...config,
        headers: {
          // Remove Content-Type header to let browser set multipart/form-data with boundary
          "Content-Type": undefined,
          ...config.headers,
        },
      });
    }
    return axiosInstance.post(url, data, config);
  },
  put: (url, data, config = {}) => {
    if (data instanceof FormData) {
      return axiosInstance.put(url, data, {
        ...config,
        headers: {
          "Content-Type": undefined,
          ...config.headers,
        },
      });
    }
    return axiosInstance.put(url, data, config);
  },
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  patch: (url, data, config = {}) => {
    if (data instanceof FormData) {
      return axiosInstance.patch(url, data, {
        ...config,
        headers: {
          "Content-Type": undefined,
          ...config.headers,
        },
      });
    }
    return axiosInstance.patch(url, data, config);
  },
};
