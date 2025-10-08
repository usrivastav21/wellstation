import { apiClient } from "../../api-client";

export const fetchVenues = async () => {
  try {
    const response = await apiClient.get("/booth/fetch/locations");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
