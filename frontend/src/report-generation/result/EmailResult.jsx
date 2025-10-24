import {
  AbsoluteCenter,
  Center,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import { getCurrentRoleData } from "../../api-client/auth";
import { stepAtom, reportIdAtom } from "../../atoms";
import StepCountHeader from "../../components/StepCountHeader";
import { config } from "../../config";
import { Button } from "../../design-system";
import { Email, TextInput } from "../../form-inputs";
import { MoodFeedback } from "./MoodFeedback";
import { useSendEmail } from "./useSendEmail";

export const EmailResult = () => {
  const { t } = useTranslation();
  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose,
  } = useDisclosure();
  const [selectedMood, setSelectedMood] = useState(null);
  const candidateId = useAtomValue(reportIdAtom);
  const setStep = useSetAtom(stepAtom);

  const { mutate: sendEmail, isPending } = useSendEmail({
    onSuccess: () => {
      setStep("report");
    },
  });
  const loggedInUser = getCurrentRoleData("admin");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1),
        email: z.email({
          message: t("booth.steps.email-result.email-error"),
        }),
      })
    ),
  });

  const onSubmit = (data) => {
    const reportLink = `${
      config.REPORT_URL
    }/${candidateId}?boothVenue=${encodeURIComponent(
      loggedInUser?.userName
    )}&launch=${encodeURIComponent(loggedInUser?.launch || "default")}`;

    console.log("selected mood", selectedMood);
    sendEmail({
      reportLink,
      name: data.name,
      email: data.email,
      reportId: candidateId,
      mood: selectedMood,
    });
  };

  useEffect(() => {
    if (!isFeedbackOpen) {
      onFeedbackOpen();
    }
  }, [onFeedbackOpen]);

  const onSelect = (value) => {
    setSelectedMood(value);
    onFeedbackClose();
  };

  return (
    <Container maxW={"container.md"} mt={7}>
      <MoodFeedback
        isOpen={isFeedbackOpen}
        onClose={onFeedbackClose}
        onSelect={onSelect}
      />
      <VStack rowGap={14}>
        <HStack
          justifyContent={"center"}
          w={"100%"}
          position={"relative"}
          columnGap={12}
        >
          <AbsoluteCenter axis="vertical" left={10}>
            <StepCountHeader step={3} totalSteps={3} />
          </AbsoluteCenter>
          <Text
            color="primary.400"
            fontFamily="Poetsen One"
            fontSize={"2xl"}
            fontWeight={"bold"}
            whiteSpace={"pre-line"}
            textAlign={"center"}
          >
            {t("result.congratulations")}
          </Text>
        </HStack>

        <Text
          textAlign={"center"}
          fontSize={"xl"}
          fontWeight={"bold"}
          whiteSpace={"pre-line"}
        >
          {t("result.glow-festival-completion-message")}
        </Text>
      </VStack>
      <Center>
        <VStack
          maxW="460px"
          w="100%"
          as="form"
          mt={6}
          onSubmit={handleSubmit(onSubmit)}
          rowGap={6}
        >
          <VStack w="100%">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>{t("general.name")}</FormLabel>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  // TODO: replace with TextInput from our design system
                  <TextInput
                    {...field}
                    fontWeight="bold"
                    borderWidth="2px"
                    fontSize="md"
                    error={errors.name}
                    _focusVisible={{
                      boxShadow: "accent-border-shadow-sm",
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>{t("general.email-address")}</FormLabel>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Email
                    {...field}
                    shouldIncludeSuffix={false}
                    error={errors.email}
                    // TODO: updated email styles not available as branch is not yet updated
                    fontSize="md"
                    fontWeight="bold"
                    borderWidth="2px"
                    placeholder=""
                    maxW="100%"
                    _focusVisible={{
                      boxShadow: "accent-border-shadow-sm",
                    }}
                  />
                )}
              />
            </FormControl>
          </VStack>
          <Button
            borderRadius="lg"
            fontWeight="bold"
            size="lg"
            variant="primary"
            boxShadow="none"
            type="submit"
            w={"100%"}
            isDisabled={!watch("name") || !watch("email") || isPending}
            isLoading={isPending}
            py={1.5}
          >
            {t("result.lets-see-my-result")}
          </Button>
        </VStack>
      </Center>
    </Container>
  );
};
