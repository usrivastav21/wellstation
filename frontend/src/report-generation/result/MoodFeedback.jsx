import {
  HStack,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pt={4} px={4} pb={6} textAlign={"center"}>
          Let’s do a quick mood check.
          <br />
          How are you feeling right now?
        </ModalHeader>
        <ModalBody px={4} pb={4} pt={0}>
          <HStack columnGap={2}>
            {feedbackData.map((item) => (
              <IconButton
                key={item.value}
                display={"flex"}
                flexDirection={"column"}
                bg="transparent"
                _hover={{
                  bg: "transparent",
                }}
                _active={{
                  bg: "#FAE0C2",
                }}
                height="unset"
                py={3}
                px={2.5}
                isActive={selectedValue === item.value}
                icon={
                  <VStack rowGap={2}>
                    <Image src={item.icon} width="56px" height="56px" />
                    <Text
                      fontWeight={selectedValue === item.value ? "bold" : "500"}
                    >
                      {item.label}
                    </Text>
                  </VStack>
                }
                onClick={() => {
                  console.log("MoodFeedback: Clicked on", item.value);
                  setSelectedValue(item.value);
                  onSelect(item.value);
                  onClose(); // Explicitly close the modal
                  console.log("MoodFeedback: Called onClose");
                }}
              ></IconButton>
            ))}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
