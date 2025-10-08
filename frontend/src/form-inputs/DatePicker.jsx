import {
  Flex,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from "@chakra-ui/react";
import { formatDate } from "date-fns";
import { forwardRef } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FormErrorMessage } from "../design-system";
import { TextInput } from "../form-inputs";

// import { Calendar } from "react-day-picker";
// import "react-datepicker/dist/react-datepicker.css";
import datePickerStyles from "./datePicker.module.css";
// import "react-day-picker/style.css";
// export const DatePicker = (props) => {
//   const YEARS = Array.from({ length: 16 }, (_, i) => 2014 + i);
//   const MONTHS = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   const [viewMode, setViewMode] = useState("day"); // "year" | "month" | "day"
//   const [selected, setSelected] = useState();
//   const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
//   const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());

//   // When a year is picked
//   const handleYearSelect = (year) => {
//     setDisplayYear(year);
//     setViewMode("month");
//   };

//   // When a month is picked
//   const handleMonthSelect = (monthIdx) => {
//     setDisplayMonth(monthIdx);
//     setViewMode("day");
//   };

//   // When a day is picked
//   const handleDaySelect = (date) => {
//     setSelected(date);
//     if (props.onSelect) props.onSelect(date);
//   };

//   // Custom header
//   const CustomCaption = () => (
//     <SimpleGrid columns={3} alignItems="center" mb={2}>
//       <Button variant="ghost" onClick={() => setViewMode("year")}>
//         {displayYear}
//       </Button>
//       <Button variant="ghost" onClick={() => setViewMode("month")}>
//         {MONTHS[displayMonth]}
//       </Button>
//       <div />
//     </SimpleGrid>
//   );

//   return (
//     <VStack rowGap={4} alignItems="flex-start">
//       {viewMode === "year" && (
//         <SimpleGrid columns={4} gap={2}>
//           {YEARS.map((year) => (
//             <Button
//               key={year}
//               colorScheme={year === displayYear ? "orange" : "gray"}
//               onClick={() => handleYearSelect(year)}
//             >
//               {year}
//             </Button>
//           ))}
//         </SimpleGrid>
//       )}

//       {viewMode === "month" && (
//         <SimpleGrid columns={4} gap={2}>
//           {MONTHS.map((month, idx) => (
//             <Button
//               key={month}
//               colorScheme={idx === displayMonth ? "orange" : "gray"}
//               onClick={() => handleMonthSelect(idx)}
//             >
//               {month}
//             </Button>
//           ))}
//         </SimpleGrid>
//       )}

//       {viewMode === "day" && (
//         <DayPicker
//           month={new Date(displayYear, displayMonth)}
//           selected={selected}
//           onSelect={handleDaySelect}
//           components={{
//             CaptionLabel: CustomCaption,
//             MonthGrid: (props) => {
//               console.log("month grid", props);
//               return props.children;
//             },
//           }}
//         />
//       )}

//       {/* <div>
//         {selected
//           ? `Selected: ${selected.toLocaleDateString()}`
//           : "Pick a day."}
//       </div> */}
//     </VStack>
//   );
// };

// 2nd approach
const CustomInput = forwardRef((props, ref) => {
  return (
    <Flex columnGap={2} alignItems={"center"}>
      <TextInput
        {...props}
        ref={ref}
        placeholder="MM/YYYY"
        maxWidth={"584px"}
      />
    </Flex>
  );
});

CustomInput.displayName = "CustomInput";

// export const DatePicker = (props) => {
//   console.log("selected date", props);
//   return (
//     <VStack rowGap={4} alignItems="flex-start">
//       <ReactDatePicker
//         showMonthYearPicker
//         selected={props.value}
//         onChange={(date) => props.onChange(date.toISOString())}
//         onBlur={props.onBlur}
//         name={props.name}
//         ref={props.ref}
//         dateFormat="MM/yyyy"
//         placeholderText="MM/YYYY"
//         customInput={<CustomInput />}
//       />
//       {props.error && (
//         <FormErrorMessage
//           color="error.100"
//           fontSize={"32px"}
//           fontWeight={"bold"}
//           m={0}
//         >
//           {props.error.message}
//         </FormErrorMessage>
//       )}
//     </VStack>
//   );
// };

export const DatePicker = (props) => {
  return (
    <VStack rowGap={4} alignItems="flex-start">
      <Popover placement="bottom-start">
        {({ onClose }) => {
          return (
            <>
              <PopoverTrigger>
                <CustomInput
                  value={props.value ? formatDate(props.value, "MM/yyyy") : ""}
                  error={props.error}
                />
              </PopoverTrigger>
              <PopoverContent
                w={{
                  lg: "container.md",
                }}
                borderRadius={"xl"}
              >
                <PopoverArrow />
                <Calendar
                  onChange={(date) => {
                    props.onChange(date.toISOString());
                    onClose();
                  }}
                  className={[datePickerStyles.reactCalender]}
                  tileClassName={datePickerStyles.calendarTile}
                  showWeekNumbers
                  value={props.value ?? undefined}
                  maxDetail="year"
                />
              </PopoverContent>
            </>
          );
        }}
      </Popover>
      {props.error && (
        <FormErrorMessage>{props.error.message}</FormErrorMessage>
      )}
    </VStack>
  );
};
