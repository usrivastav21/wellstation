import { Button } from "@chakra-ui/react";
import PropTypes from "prop-types";

const CustomButton = ({ variant = "brand", children, ...props }) => {
  return (
    <Button variant={variant} {...props}>
      {children}
    </Button>
  );
};

CustomButton.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
};

export default CustomButton;
