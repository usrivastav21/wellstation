import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import {
  BadIcon,
  GoodIcon,
  GreatIcon,
  NeutralIcon,
  WorstIcon,
} from "../../assets/icons";

export const MoodFeedback = ({ isOpen, onClose, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const feedbackData = [
    {
      icon: GreatIcon,
      label: "Great",
      value: "great",
    },
    {
      icon: GoodIcon,
      label: "Good",
      value: "good",
    },
    {
      icon: NeutralIcon,
      label: "Neutral",
      value: "neutral",
    },
    {
      icon: BadIcon,
      label: "Bad",
      value: "bad",
    },
    {
      icon: WorstIcon,
      label: "Worst",
      value: "worst",
    },
  ];

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      size={{ base: "xs", sm: "md" }}
      withCloseButton={false}
      styles={{
        content: {
          border: "2px solid #E55A2B",
          borderRadius: "16px",
        }
      }}
    >
      <Stack gap={{ base: "lg", sm: "xl" }} align="center" p={{ base: "lg", sm: "xl" }}>
        <Title
          order={2}
          ta="center"
          c="var(--mantine-color-text-9)"
          fw={600}
          size={{ base: "h4", sm: "h3" }}
          px={{ base: 16, sm: 0 }}
        >
          Let's do a quick mood check.
          <br />
          How are you feeling right now?
        </Title>
        
        <Group gap={{ base: "sm", sm: "md" }} justify="center" wrap="wrap">
          {feedbackData.map((item) => (
            <Button
              key={item.value}
              variant={selectedValue === item.value ? "filled" : "outline"}
              color={selectedValue === item.value ? "orange" : "gray"}
              size={{ base: "md", sm: "lg" }}
              p={{ base: "sm", sm: "md" }}
              h="auto"
              onClick={() => {
                console.log("MoodFeedback: Clicked on", item.value);
                setSelectedValue(item.value);
                onSelect(item.value);
                onClose();
                console.log("MoodFeedback: Called onClose");
              }}
              styles={{
                root: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: { base: "80px", sm: "100px" },
                  height: "auto",
                  padding: { base: "12px 8px", sm: "16px 12px" },
                  borderRadius: "12px",
                  border: selectedValue === item.value ? "2px solid #E55A2B" : "2px solid #E0E0E0",
                  backgroundColor: selectedValue === item.value ? "#FAE0C2" : "transparent",
                  "&:hover": {
                    backgroundColor: selectedValue === item.value ? "#FAE0C2" : "#F5F5F5",
                    borderColor: selectedValue === item.value ? "#E55A2B" : "#D0D0D0",
                  },
                },
                inner: {
                  flexDirection: "column",
                  gap: "8px",
                },
              }}
            >
              <Box
                component="img"
                src={item.icon}
                alt={item.label}
                style={{
                  width: { base: "40px", sm: "48px" },
                  height: { base: "40px", sm: "48px" },
                }}
              />
              <Text
                fw={selectedValue === item.value ? 700 : 500}
                size={{ base: "xs", sm: "sm" }}
                ta="center"
              >
                {item.label}
              </Text>
            </Button>
          ))}
        </Group>
      </Stack>
    </Modal>
  );
};
