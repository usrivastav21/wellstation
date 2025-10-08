import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Flex,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightAddon,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { Center, Stack } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { z } from "zod/v4";

import { isRoleLoggedIn } from "../api-client/auth";
import { boothVenueAtom, loggedInUserAtom } from "../atoms";
import { UPDATED_TAB_SIZES } from "../atoms/sd";
import { Button } from "../design-system/button";
import { TextInput } from "../form-inputs";
import { useLogin } from "./useLogin";
import { LoginHeader } from "./LoginHeader";

export const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const setLoggedInUser = useSetAtom(loggedInUserAtom);
  const setBoothVenue = useSetAtom(boothVenueAtom);
  const loggedInUser = useAtomValue(loggedInUserAtom);

  const SIZES = UPDATED_TAB_SIZES;

  const breakPointValues = {
    containerWidth: {
      base: "100%",
      sm: "60%",
      md: "50%",
      lg: "35%",
      xl: "600px",
    },
    titleSize: {
      base: "20px",
      sm: "24px",
      md: "28px",
      lg: "32px",
      xl: SIZES[28],
    },
    fontSize: {
      base: "14px",
      sm: "16px",
      md: "18px",
      lg: "40px",
    },
    inputHeight: {
      base: "36px",
      sm: "40px",
      md: 8.5,
      lg: 18,
      // xl: SIZES[35],
    },
  };

  const { mutate: login, isPending } = useLogin({
    onSuccess: (data) => {
      setBoothVenue(data.venue);

      // TODO: add admin id/user_name to boothVenue
      localStorage.setItem("boothVenue", data.user?.user_name);
      setLoggedInUser(data.user);
      console.log("data", data);
    },
  });

  const containerWidth = useBreakpointValue(breakPointValues.containerWidth);
  const fontSize = useBreakpointValue(breakPointValues.fontSize);
  const inputHeight = useBreakpointValue(breakPointValues.inputHeight);

  const onSubmit = async (data) => {
    const payload = {
      username: data.username,
      password: data.password,
      role: "admin",
    };

    console.log("in onSubmit");
    login(payload);
  };

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    ),
  });

  console.log({
    isRoleLoggedIn: isRoleLoggedIn("admin"),
    loggedInUser,
  });

  if (isRoleLoggedIn("admin")) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Center h={"100%"}>
      <Stack
        maw={694}
        mah={748}
        bdrs={32}
        bg="white"
        p={32}
        gap={12}
        bd={"4px solid var(--mantine-color-brand-6)"}
      >
        <LoginHeader title="Admin Login" />

        <Flex
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          width="100%"
          direction="column"
        >
          <VStack gap={4}>
            <FormControl
              isInvalid={!!errors.username}
              direction="column"
              gap="4px"
            >
              <FormLabel mb={0.5} fontSize={fontSize} fontWeight="bold">
                Username
              </FormLabel>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextInput
                    height={inputHeight}
                    fontSize={fontSize}
                    placeholder="Enter username"
                    {...field}
                  />
                )}
              />
            </FormControl>

            <FormControl
              isInvalid={!!errors.password}
              direction="column"
              gap="4px"
            >
              <FormLabel mb={0.5} fontSize={fontSize} fontWeight="bold">
                Password
              </FormLabel>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <InputGroup size="md">
                    <TextInput
                      height={inputHeight}
                      fontSize={fontSize}
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      borderTopRightRadius={0}
                      borderBottomRightRadius={0}
                    />
                    <InputRightAddon
                      height={inputHeight}
                      bg="transparent"
                      w="fit-content"
                      p={0}
                      borderColor="gray.200"
                    >
                      <Button
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        bg="transparent"
                        _hover={{ bg: "transparent" }}
                        height={{
                          md: "space-8.5",
                          lg: "space-18",
                        }}
                      >
                        {showPassword ? (
                          <ViewOffIcon
                            w={{ base: 5, sm: 6, md: 7, lg: 8 }}
                            h={{ base: 5, sm: 6, md: 7, lg: 8 }}
                            color="gray.500"
                          />
                        ) : (
                          <ViewIcon
                            w={{ base: 5, sm: 6, md: 7, lg: 8 }}
                            h={{ base: 5, sm: 6, md: 7, lg: 8 }}
                            color="gray.500"
                          />
                        )}
                      </Button>
                    </InputRightAddon>
                  </InputGroup>
                )}
              />
            </FormControl>
          </VStack>

          {/* Venue Selection Dropdown */}
          {/* <Flex width="100%" direction="column" gap="4px">
              <Text fontSize={labelSize} fontWeight="500" fontFamily="Lato">
                Venue
              </Text>
              <Select
                height={inputHeight}
                width="100%"
                fontSize={labelSize}
                placeholder={
                  venues && venues.length > 0
                    ? "Select venue"
                    : "No venues available"
                }
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                borderColor="gray.400"
                _focus={{
                  borderColor: "#F5703D",
                  boxShadow: "0 0 0 1px #F5703D",
                }}
                isDisabled={!venues || venues.length === 0}
              >
                {venues && venues?.length > 0 ? (
                  venues?.map((venue) => (
                    <option
                      key={venue._id || `venue-${Math.random()}`}
                      value={venue._id || ""}
                    >
                      {venue?.name || "Unnamed Venue"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No venues available
                  </option>
                )}
              </Select>
            </Flex> */}

          <Button
            type="submit"
            fontSize={fontSize}
            fontWeight="bold"
            mt={{ md: 6, lg: 12 }}
            variant="primary"
            size="lg"
            isLoading={isPending}
            isDisabled={isPending}
            borderRadius={{
              base: "var(--chakra-radii-lg)",
              lg: "var(--chakra-radii-2xl)",
            }}
            h={{ base: "36px", sm: "40px", md: "40px", lg: "72px" }}
            boxShadow="primary-border-shadow-sm"
          >
            {"Login"}
          </Button>
        </Flex>
      </Stack>
    </Center>
  );
};

export default AdminLogin;
