import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";

const toClientRecommendations = (response) => {
  const data = response.data.data;
  console.log("data", data);
  return {
    emotionalProfileDisplay: data.emotional_profile_display,
    playlist: data.playlist_id,
    videos: data.videos.map((video) => ({
      id: video.id,
      title: video.title,
      channelName: video.playlist_channel_title,
      viewCount: video.view_count,
      publishedAt: video.published_at,
      thumbnail: video.thumbnail,
      description: video.description,
    })),
  };
};

const fetchRecommendations = async (ctx) => {
  const [, reportId] = ctx.queryKey;
  const response = await apiClient.get(
    `/resources/recommendations/${reportId}?limit=100`
  );
  return toClientRecommendations(response);
};

const useRecommendations = (reportId) => {
  return useQuery({
    queryKey: ["recommendations", reportId],
    queryFn: fetchRecommendations,
    enabled: !!reportId,
  });
};

export default useRecommendations;
