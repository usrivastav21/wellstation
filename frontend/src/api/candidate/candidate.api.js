import { apiClient } from "../../api-client";

export const getCandidateById = async (id) => {
  try {
    const response = await apiClient.get(`/candidate/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const saveCandidateAPI = async (candidate) =>
  (await apiClient.post("/candidate/", candidate))?.data?.data || {};

export const uploadCandidateVideo = async (payload) => {
  console.log("payload", payload);
  try {
    const response = await apiClient.post("/video", payload);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadCandidateVideoTrial = async (payload) => {
  try {
    const response = await apiClient.post("/trial/video", payload);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadCandidateAudio = async (payload) => {
  try {
    const response = await apiClient.post("/audio", payload);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadCandidateAudioTrial = async (payload) => {
  try {
    const response = await apiClient.post("/trial/audio", payload);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
