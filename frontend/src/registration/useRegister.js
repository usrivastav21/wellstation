import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS, apiClient, setAuthToken } from "../api-client";

const transformToApiBody = (data) => {
  return {
    email: data.email,
    pin: data.pin,
    confirm_pin: data.confirmPin,
    gender: data.gender,
    birth_month_year: data.dateOfBirth,
    role: "user",
    ...data,
  };
};

const registerUser = async (data) => {
  const apiBody = transformToApiBody(data);
  const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, apiBody, {
    skipAuth: true,
  });

  if (response.data.token && response.data.user.role) {
    setAuthToken({
      token: response.data.token,
      role: response.data.user.role,
      email: response.data.user?.email,
      userName: response.data.user?.user_name,
      launch: response.data.user?.launch,
    });
  }
  return response.data;
};

export const useRegister = (options) => {
  return useMutation({
    mutationFn: (data) => {
      return registerUser(data);
    },
    ...options,
  });
};
