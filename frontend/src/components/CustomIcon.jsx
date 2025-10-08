import { Icon } from "@chakra-ui/react";
import PropTypes from "prop-types";

const CustomIcon = (props) => {
  const {
    icon,
    width = "22px",
    height = "22px",
    color = "grey.100",
    ...rest
  } = props;
  return (
    <Icon as={icon} width={width} height={height} color={color} {...rest} />
  );
};

CustomIcon.propTypes = {
  icon: PropTypes.elementType,
  width: PropTypes.string || PropTypes.number,
  height: PropTypes.string || PropTypes.number,
  color: PropTypes.string, // Add color propType
};

export default CustomIcon;
