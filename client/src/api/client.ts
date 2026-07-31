import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;

let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

function processQueue(
  error?: unknown
) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });

  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/me" &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(
          (
            resolve,
            reject
          ) => {
            failedQueue.push({
              resolve,
              reject,
            });
          }
        ).then(() =>
          apiClient(originalRequest)
        );
      }

      isRefreshing = true;

      try {
        await apiClient.post(
          "/auth/refresh"
        );

        processQueue();

        return apiClient(
          originalRequest
        );
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);