import { HStack, Image, Text, useRadioGroup, VStack } from "@chakra-ui/react";
import FemaleIcon from "../assets/female.svg";
import MaleIcon from "../assets/male.svg";
import { FormErrorMessage } from "../design-system";
import { genderOptions } from "./config";
import { RadioGenderCard } from "./RadioGenderCard";

export const GenderSelection = ({ ...props }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "gender",
    onChange: console.log,
  });

  const group = getRootProps();

  return (
    <VStack rowGap={4} alignItems={"flex-start"}>
      <HStack columnGap={20} {...group} {...props}>
        {genderOptions.map((value) => {
          const radio = getRadioProps({ value });
          return (
            <RadioGenderCard key={value} {...radio}>
              <Image
                src={value === "male" ? MaleIcon : FemaleIcon}
                alt={value}
                w={{
                  md: "64px",
                  lg: "84px",
                }}
                h={{
                  md: "68px",
                  lg: "88px",
                }}
              />
              <Text
                fontSize={{
                  md: "2xl",
                  lg: "3xl",
                }}
                fontWeight={"bold"}
              >
                {value === "male" ? "Male" : "Female"}
              </Text>
            </RadioGenderCard>
          );
        })}
      </HStack>
      {props.error && (
        <FormErrorMessage>{props.error.message}</FormErrorMessage>
      )}
    </VStack>
  );
};
