import { Stack, Group, Text, Box } from "@mantine/core";
import { format } from "date-fns";
import { useRef, useState, useEffect } from "react";

export const MetaData = ({ video }) => {
  return (
    <Stack gap={8}>
      <Text fz="lg" fw="bold">
        {video.title}
      </Text>
      <Group gap={8}>
        <Text>{video.channelName}</Text>•<Text>{video.viewCount}</Text>•
        <Text>{format(video.publishedAt, "MMM d, yyyy")}</Text>
      </Group>
    </Stack>
  );
};

export const VideoPlayer = ({
  video,
  showMetadata = true,
  autoplay = false,
  controls = true,
  modestbranding = true,
  rel = false,
  showinfo = false,
  width = "100%",
  height = 674,
}) => {
  const buildEmbedUrl = (videoId) => {
    const params = new URLSearchParams({
      autoplay: autoplay ? 1 : 0,
      controls: controls ? 1 : 0,
      modestbranding: modestbranding ? 1 : 0,
      rel: 0,
      showinfo: showinfo ? 1 : 0,
      iv_load_policy: 3, // Disable annotations
      fs: 1, // Enable fullscreen
      cc_load_policy: 0, // Disable closed captions by default
      origin: window.location.origin,
      // playsinline: 1,
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    // if (!window.YT) {
    //   const tag = document.createElement("script");
    //   tag.src = "https://www.youtube.com/iframe_api";
    //   const firstScriptTag = document.getElementsByTagName("script")[0];
    //   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    //   window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    // } else if (window.YT.Player) {
    //   onYouTubeIframeAPIReady();
    // }
  }, []);

  // const onYouTubeIframeAPIReady = () => {
  //   if (window.YT && window.YT.Player && video) {
  //     const newPlayer = new window.YT.Player(playerRef.current, {
  //       height: height,
  //       width: width,
  //       videoId: video.id,
  //       playerVars: {
  //         // Enable all controls
  //         controls: 1,
  //         // Minimal YouTube branding
  //         modestbranding: 1,
  //         // Don't show related videos
  //         rel: 0,
  //         // Don't show video info overlay
  //         showinfo: 0,
  //         // Enable fullscreen
  //         fs: 0,
  //         // Disable annotations
  //         iv_load_policy: 3,
  //         // Disable closed captions by default
  //         cc_load_policy: 0,
  //         // Set origin for security
  //         origin: window.location.origin,
  //         // Don't autoplay
  //         autoplay: 0,
  //         // Enable JavaScript API
  //         enablejsapi: 1,
  //         // Better mobile experience
  //         playsinline: 1,
  //         // Player color theme
  //         color: "white",
  //       },
  //       events: {
  //         onReady: (event) => {
  //           setPlayer(event.target);
  //           setIsReady(true);
  //           console.log("YouTube player ready");
  //         },
  //         onStateChange: (event) => {
  //           // Handle player state changes if needed
  //           console.log("Player state changed:", event.data);
  //         },
  //         onError: (event) => {
  //           console.error("YouTube player error:", event.data);
  //         },
  //       },
  //     });
  //   }
  // };

  if (!video) {
    return null;
  }

  return (
    <Stack w="100%">
      {/* <div
        ref={playerRef}
        style={{
          width: "100%",
          height: height,
          position: "absolute",
          top: 0,
          left: 0,
          // Ensure player is properly positioned
          display: "block",
        }}
      /> */}
      <Box w={width} h={height}>
        <iframe
          src={buildEmbedUrl(video.id)}
          title={video.title}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </Box>
      {showMetadata && <MetaData video={video} />}
    </Stack>
  );
};
