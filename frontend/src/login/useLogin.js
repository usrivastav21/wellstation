import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS, apiClient } from "../api-client";
import { setAuthToken } from "../api-client/auth";

const transformToApiBody = (data) => {
  if (data.role === "admin") {
    return {
      user_name: data.username,
      password: data.password,
      role: data.role,
    };
  }

  if (data.role === "user") {
    return {
      email: data.email,
      pin: data.pin,
      role: data.role,
    };
  }
};

const loginUser = async (data) => {
  const apiBody = transformToApiBody(data);
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, apiBody);

  // Store the token if it exists in the response
  if (response.data.token && response.data.user.role) {
    setAuthToken({
      token: response.data.token,
      role: response.data.user.role,
      email: response.data.user?.email,
      userName: response.data.user?.user_name,
      launch: response.data.user?.launch,
      age: response.data.user?.age,
      gender: response.data.user?.gender,
    });
  }

  return response.data;
};

export const useLogin = (options) => {
  return useMutation({
    mutationFn: (data) => {
      return loginUser(data);
    },
    ...options,
  });
};
