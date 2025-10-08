import { Loader, Modal, Paper, Stack, Center } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { reportIdAtom, trialIdAtom } from "../atoms";
import useRecommendations from "./useRecommendations";
import { MetaData, VideoPlayer } from "./VideoPlayer";
// import { VideoPlayer } from "./VideoPlayer";

export const Playlist = () => {
  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);
  const recommendations = useRecommendations(reportId || trialId);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (recommendations.isFetching) {
    return (
      <Center>
        <Paper>
          <Loader />
        </Paper>
      </Center>
    );
  }

  return (
    <Paper py={32}>
      <Stack maw={1616} gap={48}>
        {recommendations.data?.videos.map((video) => (
          <Stack gap={16} key={video.id}>
            {/* <Image
              src={video.thumbnail}
              alt={video.title}
              w={1616}
              h={674}
              fit="cover"
              onClick={() => {
                setSelectedVideo(video);
                setIsModalOpen(true);
              }}
            /> */}
            <VideoPlayer
              video={video}
              showMetadata={false}
              modestbranding={false}
            />
            <MetaData video={video} />
          </Stack>
        ))}
      </Stack>
      <Modal
        opened={isModalOpen}
        size={"xl"}
        closeButtonProps={{
          size: "xl",
        }}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVideo(null);
        }}
      >
        <VideoPlayer video={selectedVideo} showMetadata={false} />
      </Modal>
    </Paper>
  );
};
