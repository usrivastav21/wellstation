import { Text, TextInput, rem } from "@mantine/core";
import PropTypes from "prop-types";
import { EMAIL_SUFFIX } from "./config";

export const Email = ({
  placeholder = "Enter here",
  label = "Email",
  suffix = EMAIL_SUFFIX,
  shouldIncludeSuffix = true,
  error,
  ...props
}) => {
  // Filter out props that are not valid for TextInput
  const {
    borderWidth,
    maxW,
    _focusVisible,
    ...validProps
  } = props;

  return (
    <TextInput
      size="xl"
      label={label}
      {...validProps}
      error={error}
      errorProps={{
        fz: "lg",
      }}
      placeholder="Enter your email"
      rightSectionWidth={rem(324)}
      rightSection={
        shouldIncludeSuffix && (
          <Text fz="3xl" fw="bold">
            {suffix}
          </Text>
        )
      }
    />
  );
};

Email.propTypes = {
  placeholder: PropTypes.string,
  suffix: PropTypes.string,
  shouldIncludeSuffix: PropTypes.bool,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};
