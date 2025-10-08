import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Drawer,
  Group,
  Image,
  Indicator,
  Loader,
  rem,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
  ActionIcon,
  Progress,
  Center,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { ReferenceArea } from "recharts";
import { LineChart } from "@mantine/charts";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { useAtomValue, useSetAtom } from "jotai";
import { reportIdAtom, trialIdAtom } from "../atoms";
import { generateReportId } from "../utils";
import {
  addWeeks,
  endOfISOWeek,
  format,
  formatISO,
  subWeeks,
  startOfISOWeek,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from "date-fns";
import get from "lodash/get";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router";

import { Coin } from "../assets/illustrations";
import { CoinIcon, CoinIconUnfilled } from "../assets/icons";
import { ageAtom, selectedGenderAtom, stepAtom } from "../atoms";
import {
  useMonthReports,
  useMonthReportsWithIntervals,
  useWeekReports,
  useYearReports,
} from "./useReports";
import {
  GenerateQrCode,
  getLevelsDisplayText,
  getMentalHealthScoresLevelColor,
} from "../report-generation";
import { useRewards } from "./useRewards";
import { getCurrentRoleData } from "../api-client";

import classes from "./Dashboard.module.css";
import { RewardsMessage } from "./RewardsMessage";
import { VideoRecommendationModal } from "../resources/VideoRecommendationModal";

const ResultRow = ({ report }) => {
  const time = format(new Date(report.created_at), "hh:mm aaa");
  const stressColor = getMentalHealthScoresLevelColor(
    report.mental_health_scores.stress
  );
  const anxietyColor = getMentalHealthScoresLevelColor(
    report.mental_health_scores.anxiety
  );
  const depressionColor = getMentalHealthScoresLevelColor(
    report.mental_health_scores.depression
  );

  return (
    <Group gap={rem(20)} justify="space-between">
      <Text fz="lg">{time}</Text>
      <Stack gap={0} flex={0.9}>
        <Group justify="space-between">
          <Text fz="2xl">Stress Levels</Text>
          <Text fz="2xl" c={stressColor}>
            {getLevelsDisplayText(report.mental_health_scores.stress)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz="2xl">Anxiety Levels</Text>
          <Text fz="2xl" c={anxietyColor}>
            {getLevelsDisplayText(report.mental_health_scores.anxiety)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz="2xl">Depression Levels</Text>
          <Text fz="2xl" c={depressionColor}>
            {getLevelsDisplayText(report.mental_health_scores.depression)}
          </Text>
        </Group>
      </Stack>

      <Box>
        <GenerateQrCode size={80} reportId={report.user_Id} />
      </Box>
    </Group>
  );
};

const Reports = ({ reports }) => {
  return (
    <Stack gap={rem(32)}>
      {reports.map((report) => (
        <ResultRow key={report.user_Id} report={report} />
      ))}
    </Stack>
  );
};

const scoreMap = {
  low: () => Math.random() * 0.9 + 0.1,
  medium: () => Math.random() * 1.15 + 1,
  high: () => Math.random() * 0.7 + 2.25,
};

const DateNavigation = ({ dateContent, updatePrevious, updateNext }) => {
  return (
    <Group h={104} justify="space-between" px={32}>
      <Text fz="3xl">{dateContent}</Text>
      <ActionIcon.Group bd={0}>
        <ActionIcon size={72} onClick={updatePrevious} variant="subtle" bd={0}>
          <FaChevronLeft size={32} />
        </ActionIcon>
        <ActionIcon bd={0} size={72} onClick={updateNext} variant="subtle">
          <FaChevronRight size={32} />
        </ActionIcon>
      </ActionIcon.Group>
    </Group>
  );
};

const Chart = ({ getChartData, xAxisProps, series }) => {
  return (
    <LineChart
      h={576}
      withLegend
      classNames={{
        legend: classes.legend,
      }}
      gridProps={{
        yAxisId: "left",
        vertical: true,
      }}
      lineChartProps={{
        margin: {
          top: 10,
          right: 20,
          left: 0,
          bottom: 10,
        },
      }}
      yAxisProps={{
        domain: [0, 3],
        ticks: [0, 0.5, 1, 1.625, 2.25, 2.625, 3],
        tickFormatter: (value) => {
          switch (value) {
            case 0:
              return "";
            case 0.5:
              return "Low";
            case 1.625:
              return "Mod";
            case 2.625:
              return "High";
            default:
              return "";
          }
        },
        tickMargin: 10,
        tick: ({
          payload,
          textAnchor,
          fill,
          width,
          height,
          stroke,
          transform,
          x,
          y,
          className,
          tickFormatter,
        }) => {
          return (
            <text
              fill={fill}
              textAnchor={textAnchor}
              width={width}
              height={height}
              stroke={stroke}
              transform={transform}
              x={x}
              y={y}
              className={className}
              fontSize={"var(--mantine-font-size-lg)"}
            >
              <tspan x={x} dy={"0.3em"}>
                {tickFormatter(payload.value)}
              </tspan>
            </text>
          );
        },
      }}
      xAxisProps={xAxisProps}
      px={32}
      pb={32}
      dataKey="date"
      data={getChartData()}
      series={series}
      curveType="linear"
    >
      <ReferenceArea
        yAxisId="left"
        fillOpacity={0.3}
        strokeOpacity={0.9}
        fill="#20B66B"
        stroke="var(--mantine-color-gray-6)"
        x1={getChartData()[0]?.date}
        x2={getChartData()[getChartData().length - 1]?.date}
        y1={0}
        y2={1}
      />
      <ReferenceArea
        yAxisId="left"
        fillOpacity={0.3}
        strokeOpacity={0.9}
        fill="#F19C34"
        stroke="var(--mantine-color-gray-6)"
        x1={getChartData()[0]?.date}
        x2={getChartData()[getChartData().length - 1]?.date}
        y1={1}
        y2={2.25}
      />
      <ReferenceArea
        yAxisId="left"
        fillOpacity={0.3}
        strokeOpacity={0.9}
        fill="#C94332"
        stroke="var(--mantine-color-gray-6)"
        x1={getChartData()[0]?.date}
        x2={getChartData()[getChartData().length - 1]?.date}
        y1={2.25}
        y2={3}
      />
    </LineChart>
  );
};

const calculateAverage = (reports, levelKey = "") => {
  if (reports.length === 0 || !levelKey) {
    return 0;
  }

  const values = reports.map((report) => {
    if (!report?.mental_health_scores?.[levelKey]) {
      return 0;
    }

    return scoreMap[report.mental_health_scores[levelKey]]();
  });

  return values.reduce((acc, curr) => acc + curr, 0) / values.length;
};

const WeekPanelContent = ({ label, levelKey }) => {
  const userData = getCurrentRoleData("user");
  const [weekStartDate, setWeekStartDate] = useState(null);
  const [weekEndDate, setWeekEndDate] = useState(null);

  const updateWeekRange = () => {
    const nextWeekStartDate = addWeeks(weekStartDate, 1);
    const nextWeekEndDate = endOfISOWeek(nextWeekStartDate);
    setWeekStartDate(nextWeekStartDate);
    setWeekEndDate(nextWeekEndDate);
  };

  const updatePreviousWeekRange = () => {
    const previousWeekStartDate = subWeeks(weekStartDate, 1);
    const previousWeekEndDate = endOfISOWeek(previousWeekStartDate);
    setWeekStartDate(previousWeekStartDate);
    setWeekEndDate(previousWeekEndDate);
  };

  useEffect(() => {
    setWeekStartDate(startOfISOWeek(new Date()));
    setWeekEndDate(endOfISOWeek(new Date()));
  }, []);

  const weekReports = useWeekReports({
    email: userData?.email,
    weekRange: `${formatISO(weekStartDate, {
      representation: "date",
    })}/${formatISO(weekEndDate, { representation: "date" })}`,
  });

  // console.log(weekReports.data?.data);

  const getChartData = useCallback(() => {
    const data = weekReports.data?.data ?? {};
    // console.log("data", data);
    const chartData = Object.keys(data)
      .map((key) => {
        const value = calculateAverage(data[key], levelKey);
        return {
          date: format(key, "dd MMM"),
          sortParam: key,
          value,
        };
      })
      .sort((a, b) => new Date(a.sortParam) - new Date(b.sortParam));

    return chartData;
  }, [weekReports.data?.data, levelKey]);

  // console.log("chart data", getChartData());

  return (
    <Stack gap={0}>
      <DateNavigation
        dateContent={`${format(weekStartDate, "dd MMM")} - ${format(
          weekEndDate,
          "dd MMM"
        )}`}
        updatePrevious={updatePreviousWeekRange}
        updateNext={updateWeekRange}
      />

      <Chart
        getChartData={getChartData}
        xAxisProps={{
          tickMargin: 10,
          tick: ({
            payload,
            fill,
            textAnchor,
            width,
            height,
            stroke,
            transform,
            x,
            y,
            className,
          }) => {
            // const [date, month, day] = payload.value.split("|");
            // console.log("paylod ", payload);
            // console.log("payload", payload);
            return (
              <text
                fill={fill}
                textAnchor={textAnchor}
                width={width}
                height={height}
                stroke={stroke}
                transform={transform}
                x={x}
                y={y}
                className={className}
                fontSize={rem(20)}
              >
                <tspan x={x} dy={"0.71em"}>
                  {payload.value}
                </tspan>
              </text>
            );
          },
        }}
        series={[{ name: "value", label: label, color: "#29338a" }]}
      />
    </Stack>
  );
};

const MonthPanelContent = ({ label, levelKey }) => {
  const userData = getCurrentRoleData("user");
  const [month, setMonth] = useState(() => new Date());

  const monthReports = useMonthReportsWithIntervals({
    email: userData?.email,
    month: format(formatISO(month, { representation: "date" }), "yyyy-MM"),
  });

  const updateNextMonth = () => {
    const nextMonth = addMonths(month, 1);
    setMonth(nextMonth);
  };

  const updatePreviousMonth = () => {
    const previousMonth = subMonths(month, 1);
    setMonth(previousMonth);
  };

  // console.log("month reports", monthReports.data?.data);

  const getChartData = useCallback(() => {
    const data = monthReports.data?.data ?? {};

    return Object.keys(data)
      .map((key) => {
        const date = key.split("/").length === 1 ? key : key.split("/")[1];
        return {
          date: format(date, "dd MMM"),
          value: calculateAverage(data[key], levelKey),
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [monthReports.data?.data, levelKey]);

  return (
    <Stack gap={0}>
      <DateNavigation
        dateContent={`${format(month, "yyyy MMM")}`}
        updatePrevious={updatePreviousMonth}
        updateNext={updateNextMonth}
      />

      <Chart
        getChartData={getChartData}
        xAxisProps={{
          tickMargin: 10,
          tick: ({
            payload,
            fill,
            textAnchor,
            width,
            height,
            stroke,
            transform,
            x,
            y,
            className,
          }) => {
            return (
              <text
                fill={fill}
                textAnchor={textAnchor}
                width={width}
                height={height}
                stroke={stroke}
                transform={transform}
                x={x}
                y={y}
                className={className}
                fontSize={rem(20)}
              >
                <tspan x={x} dy={"0.71em"}>
                  {payload.value}
                </tspan>
              </text>
            );
          },
        }}
        series={[{ name: "value", label: label, color: "#29338a" }]}
      />
    </Stack>
  );
};

const YearPanelContent = ({ label, levelKey }) => {
  const userData = getCurrentRoleData("user");
  const [year, setYear] = useState(() => new Date());

  const yearReports = useYearReports({
    email: userData?.email,
    year: format(formatISO(year, { representation: "date" }), "yyyy"),
  });

  const updateNextYear = () => {
    const nextYear = addYears(year, 1);
    setYear(nextYear);
  };

  const updatePreviousYear = () => {
    const previousYear = subYears(year, 1);
    setYear(previousYear);
  };

  const getChartData = useCallback(() => {
    const data = yearReports.data?.data ?? {};

    return Object.keys(data)
      .map((key) => {
        return {
          date: format(key, "MMM"),
          value: calculateAverage(data[key], levelKey),
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [yearReports.data?.data, levelKey]);

  return (
    <Stack gap={0}>
      <DateNavigation
        dateContent={`${format(year, "yyyy")}`}
        updatePrevious={updatePreviousYear}
        updateNext={updateNextYear}
      />

      <Chart
        getChartData={getChartData}
        xAxisProps={{
          tickMargin: 10,
          tick: ({
            payload,
            fill,
            textAnchor,
            width,
            height,
            stroke,
            transform,
            x,
            y,
            className,
          }) => {
            return (
              <text
                fill={fill}
                textAnchor={textAnchor}
                width={width}
                height={height}
                stroke={stroke}
                transform={transform}
                x={x}
                y={y}
                className={className}
                fontSize={rem(20)}
              >
                <tspan x={x} dy={"0.71em"}>
                  {payload.value}
                </tspan>
              </text>
            );
          },
        }}
        series={[{ name: "value", label: label, color: "#29338a" }]}
      />
    </Stack>
  );
};

const RewardsProgressBar = ({ currentPoints }) => {
  const PIXELS_PER_POINT = 5;

  const calculateSegment = (points) => {
    if (points <= 90) {
      return {
        startMilestone: 10,
        milestones: [10, 20, 30, 40, 50, 60, 70, 80],
        barStart: 0,
        barEnd: 90,
        segmentPoints: 90,
      };
    } else {
      const blockNumber = Math.floor((points - 91) / 90);
      const barStart = 80 + blockNumber * 90;
      const barEnd = barStart + 90;
      const startMilestone = barStart + 10;

      const milestones = Array.from(
        { length: 8 },
        (_, i) => startMilestone + i * 10
      );

      return {
        startMilestone,
        milestones,
        barStart,
        barEnd,
        segmentPoints: 91,
      };
    }
  };

  const segment = calculateSegment(currentPoints);
  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      ((currentPoints - segment.barStart) /
        (segment.barEnd - segment.barStart)) *
        100
    )
  );

  const minBarWidth =
    (segment.barEnd - segment.barStart + 1) * PIXELS_PER_POINT;
  // console.log({
  //   progressPercentage,
  //   segment,
  //   currentPoints,
  // });

  // TODO: calculate the top position using bar height and coin height with overlapped coin area;

  return (
    <Box pos={"relative"}>
      <Progress value={progressPercentage} />

      <Box pos="absolute" top={-16} left={0} right={0} h={40}>
        {segment.milestones.map((milestone) => {
          const isAchieved = currentPoints >= milestone;
          const positionInPoints = milestone - segment.barStart;
          const positionPercentage =
            (positionInPoints / (segment.barEnd - segment.barStart)) * 100;

          return (
            <Stack
              gap={0}
              align="center"
              pos="absolute"
              key={milestone}
              left={`${positionPercentage}%`}
              top={0}
              style={{
                transform: `translateX(-50%)`,
              }}
            >
              {isAchieved ? (
                <Image src={CoinIcon} w={40} h={40} />
              ) : (
                <Image src={CoinIconUnfilled} w={40} h={40} />
              )}

              <Text fz="lg" fw="bold">
                {milestone}
              </Text>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setStep = useSetAtom(stepAtom);
  const age = useAtomValue(ageAtom);
  const gender = useAtomValue(selectedGenderAtom);
  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);
  const userData = getCurrentRoleData("user");
  const setReportId = useSetAtom(reportIdAtom);
  const [activeTab, setActiveTab] = useState("overall");
  const [activeStressTab, setActiveStressTab] = useState("week");
  const [activeAnxietyTab, setActiveAnxietyTab] = useState("week");
  const [activeDepressionTab, setActiveDepressionTab] = useState("week");
  const [value, setValue] = useState(new Date());

  const [opened, { open, close }] = useDisclosure(false);
  const [
    showVideoRecommendation,
    { open: openVideoRecommendation, close: closeVideoRecommendation },
  ] = useDisclosure(false);
  const [showRewards, { open: openRewards, close: closeRewards }] =
    useDisclosure(false);

  const reports = useMonthReports({
    email: userData?.email,
    month: format(formatISO(value, { representation: "date" }), "yyyy-MM"),
  });

  const rewards = useRewards({
    email: userData?.email,
    reportId: reportId || trialId,
  });

  const totalRewardPoints = rewards.data?.totalRewardPoints || 0;

  const reportsData = reports.data?.data;
  const selectedDateReports = get(reportsData, value, null);

  console.log("age, gender", age, gender);
  useEffect(() => {
    async function invalidateRewards() {
      if (location.state?.showRewards) {
        await queryClient.invalidateQueries({ queryKey: ["rewards"] });
        openRewards();

        await queryClient.invalidateQueries({ queryKey: ["reports"] });
      }
    }
    invalidateRewards();
  }, [location.state?.showRewards, openRewards, queryClient]);

  return (
    <Stack>
      <RewardsMessage
        opened={showRewards}
        onDismiss={() => {
          openVideoRecommendation();
          closeRewards();
        }}
        onClose={() => {
          closeRewards();
        }}
      />
      <VideoRecommendationModal
        opened={showVideoRecommendation}
        onClose={() => closeVideoRecommendation()}
      />
      <ScrollArea
        w={opened ? rem(1004) : rem(1680)}
        type="always"
        scrollbars="x"
        classNames={{
          root: classes.scrollAreaRoot,
        }}
      >
        <Group
          gap={rem(56)}
          align="flex-start"
          wrap="nowrap"
          h={rem(868)}
          classNames={{
            root: classes.groupRoot,
          }}
        >
          <Stack gap="md">
            <Title fz="4xl">Result Dashboard</Title>
            <Tabs
              w={rem(968)}
              h={rem(784)}
              value={activeTab}
              onChange={setActiveTab}
              orientation="vertical"
              classNames={{
                panel: classes.panel,
                tab: classes.tab,
                root: classes.root,
                list: classes.tabsList,
              }}
              bdrs={"lg"}
            >
              <Tabs.List>
                <Tabs.Tab value="overall">Overall</Tabs.Tab>
                <Tabs.Tab value="stress">Stress</Tabs.Tab>
                <Tabs.Tab value="anxiety">Anxiety</Tabs.Tab>
                <Tabs.Tab value="depression">Depression</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel
                data-active={activeTab === "overall" || undefined}
                value="overall"
              >
                <Box bdrs={"lg"}>
                  <DatePicker
                    value={value}
                    onPreviousMonth={() => {
                      setValue(subMonths(value, 1));
                    }}
                    onNextMonth={() => {
                      setValue(addMonths(value, 1));
                    }}
                    onChange={(value) => {
                      open();
                      console.log("value", value);
                      setValue(value);
                    }}
                    renderDay={(date) => {
                      const formattedDate = formatISO(date, {
                        representation: "date",
                      });

                      const report = get(reportsData, formattedDate, null);

                      return (
                        <Indicator
                          disabled={!report}
                          color="black"
                          position="bottom-center"
                        >
                          {dayjs(date).date()}
                        </Indicator>
                      );
                    }}
                    headerControlsOrder={["level", "previous", "next"]}
                    className={classes.datePicker}
                    size="xl"
                    withCellSpacing={false}
                    hideOutsideDates
                    highlightToday
                    decadeLabelFormat={(date) => dayjs(date).format("MMM YYYY")}
                    monthLabelFormat={(date) => dayjs(date).format("MMM YYYY")}
                    yearLabelFormat={(date) => dayjs(date).format("MMM YYYY")}
                    classNames={{
                      yearsList: classes.yearsList,
                      yearsListControl: classes.yearsListControl,
                      yearsListCell: classes.yearsListCell,

                      monthCell: classes.monthCell,
                      monthsListCell: classes.monthListCell,
                      monthsList: classes.monthsList,
                      monthsListControl: classes.monthListControl,

                      day: classes.day,

                      calendarHeader: classes.calendarHeader,
                      calendarHeaderLevel: classes.calendarHeaderLevel,
                      calendarHeaderControl: classes.calendarHeaderControl,

                      weekday: classes.weekday,

                      levelsGroup: classes.levelsGroup,
                    }}
                  />

                  <Drawer
                    position="right"
                    size={rem(784)}
                    opened={opened}
                    onClose={close}
                    title={"Your Scan Result"}
                    closeButtonProps={{
                      size: "xl",
                    }}
                    removeScrollProps={{
                      enabled: false,
                    }}
                    withOverlay={false}
                    classNames={{
                      content: classes.drawerContent,
                      header: classes.drawerHeader,
                      title: classes.drawerTitle,
                      close: classes.drawerClose,
                      body: classes.drawerBody,
                    }}
                  >
                    <Title fz={"3xl"} fw="bold" mb={rem(24)}>
                      {format(value, "dd MMM yyyy")}
                    </Title>
                    {reports.isFetching || reports.isLoading ? (
                      <Loader />
                    ) : (
                      <Reports reports={selectedDateReports || []} />
                    )}
                  </Drawer>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel
                data-active={activeTab === "stress" || undefined}
                value="stress"
              >
                <Tabs
                  value={activeStressTab}
                  onChange={setActiveStressTab}
                  classNames={{
                    panel: classes.stressSubTabPanel,
                    tab: classes.stressSubTab,
                    list: classes.stressSubTabList,
                    root: classes.stressSubTabRoot,
                    tabLabel: classes.stressSubTabLabel,
                  }}
                >
                  <Tabs.List>
                    <Tabs.Tab value="week">Week</Tabs.Tab>
                    <Tabs.Tab value="month">Month</Tabs.Tab>
                    <Tabs.Tab value="year">Year</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="week">
                    <WeekPanelContent label="Stress" levelKey="stress" />
                  </Tabs.Panel>
                  <Tabs.Panel value="month">
                    <MonthPanelContent label="Stress" levelKey="stress" />
                  </Tabs.Panel>
                  <Tabs.Panel value="year">
                    <YearPanelContent label="Stress" levelKey="stress" />
                  </Tabs.Panel>
                </Tabs>
              </Tabs.Panel>
              <Tabs.Panel
                data-active={activeTab === "anxiety" || undefined}
                value="anxiety"
              >
                <Tabs
                  value={activeAnxietyTab}
                  onChange={setActiveAnxietyTab}
                  classNames={{
                    panel: classes.stressSubTabPanel,
                    tab: classes.stressSubTab,
                    list: classes.stressSubTabList,
                    root: classes.stressSubTabRoot,
                    tabLabel: classes.stressSubTabLabel,
                  }}
                >
                  <Tabs.List>
                    <Tabs.Tab value="week">Week</Tabs.Tab>
                    <Tabs.Tab value="month">Month</Tabs.Tab>
                    <Tabs.Tab value="year">Year</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="week">
                    <WeekPanelContent label="Anxiety" levelKey="anxiety" />
                  </Tabs.Panel>
                  <Tabs.Panel value="month">
                    <MonthPanelContent label="Anxiety" levelKey="anxiety" />
                  </Tabs.Panel>
                  <Tabs.Panel value="year">
                    <YearPanelContent label="Anxiety" levelKey="anxiety" />
                  </Tabs.Panel>
                </Tabs>
              </Tabs.Panel>
              <Tabs.Panel
                data-active={activeTab === "depression" || undefined}
                value="depression"
              >
                <Tabs
                  value={activeDepressionTab}
                  onChange={setActiveDepressionTab}
                  classNames={{
                    panel: classes.stressSubTabPanel,
                    tab: classes.stressSubTab,
                    list: classes.stressSubTabList,
                    root: classes.stressSubTabRoot,
                    tabLabel: classes.stressSubTabLabel,
                  }}
                >
                  <Tabs.List>
                    <Tabs.Tab value="week">Week</Tabs.Tab>
                    <Tabs.Tab value="month">Month</Tabs.Tab>
                    <Tabs.Tab value="year">Year</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="week">
                    <WeekPanelContent
                      label="Depression"
                      levelKey="depression"
                    />
                  </Tabs.Panel>
                  <Tabs.Panel value="month">
                    <MonthPanelContent
                      label="Depression"
                      levelKey="depression"
                    />
                  </Tabs.Panel>
                  <Tabs.Panel value="year">
                    <YearPanelContent
                      label="Depression"
                      levelKey="depression"
                    />
                  </Tabs.Panel>
                </Tabs>
              </Tabs.Panel>
            </Tabs>
          </Stack>

          <Stack maw={rem(656)} miw={rem(656)} h="100%">
            <Title fz="4xl">Wellbeing Rewards</Title>
            <Stack justify="space-between" flex={1}>
              <Stack gap={rem(64)}>
                <Text fz="lg">
                  Did you know that checking in on your wellbeing daily can help
                  you feel more in control, reduce stress, and boost your mood?
                  It’s a great way to stay on top of how you're
                  feeling—physically and emotionally—so you can make small
                  changes that lead to big improvements over time.
                </Text>

                <Stack>
                  <Stack gap={rem(16)} p={rem(24)} bdrs={"xl"} bg={"#fae0c2"}>
                    <Group gap={rem(16)} align="center">
                      <Image w={rem(48)} h={rem(48)} src={Coin} alt="coin" />
                      <Text fz={"xl"}>
                        Earn 1 point for each daily check-in.
                      </Text>
                    </Group>
                    <Group wrap="nowrap">
                      <Image w={rem(48)} h={rem(48)} src={Coin} alt="coin" />
                      <Text fz="3xl" ff="PoetsonOne" c="brandDark.5">
                        x2
                      </Text>
                      <Text fz="lg">
                        Hit a 5-day streak and get 2 bonus points as a reward
                        for staying consistent!
                      </Text>
                    </Group>
                  </Stack>

                  <Stack gap={48}>
                    {rewards.isFetching ? (
                      <Center>
                        <Loader />
                      </Center>
                    ) : (
                      <>
                        <Group justify="center">
                          <Text fz="2xl">You have {totalRewardPoints}</Text>
                          <Image src={CoinIcon} w={52} h={52} />
                        </Group>

                        <RewardsProgressBar currentPoints={totalRewardPoints} />
                      </>
                    )}
                  </Stack>
                </Stack>
              </Stack>
              <Button
                variant="brand-filled"
                bdrs="lg"
                bd={"4px solid var(--mantine-color-text-9)"}
                size="xxl"
                onClick={() => {
                  setReportId(generateReportId());
                  setStep("facialAnalysis");
                  navigate("/booth");
                }}
              >
                Proceed To Scan
              </Button>
            </Stack>
          </Stack>
        </Group>
      </ScrollArea>
    </Stack>
  );
};

{
  /* <Button
onClick={() => {
  setIsModalOpen(true);
}}
>
open modal
</Button>
<Modal
opened={isModalOpen}
onClose={() => {
  setIsModalOpen(false);
}}
centered={true}
size={rem(728)}
maw={rem(728)}
padding={0}
withCloseButton={false}
>
<Stack px={rem(32)} pt={rem(16)} gap={rem(16)}>
  <Title
    fz={rem(32)}
    fw={"var(--mantine-heading-font-weight)"}
    c="#a7a6a5"
    order={5}
  >
    Date range
  </Title>
  <Text>Show the date range here</Text>
</Stack>
<DatePicker
  headerControlsOrder={["level", "previous", "next"]}
  hideOutsideDates
  size="xl"
  type="range"
  decadeLabelFormat={() => dayjs().format("MMM YYYY")}
  monthLabelFormat={() => dayjs().format("MMM YYYY")}
  yearLabelFormat={() => dayjs().format("MMM YYYY")}
  withCellSpacing={false}
  classNames={{
    monthCell: classes.monthCell,
    monthsListCell: classes.monthListCell,
    monthsList: classes.monthsList,
    monthsListControl: classes.monthListControl,

    yearsList: classes.yearsList,
    yearsListControl: classes.yearsListControl,
    yearsListCell: classes.yearsListCell,

    day: classes.day,

    weekday: classes.weekday,

    calendarHeader: classes.calendarHeader,

    levelsGroup: classes.levelsGroup,
  }}
/>
<Divider />
<Group gap={0}>
  <Button
    fz={rem(32)}
    bdrs={0}
    flex={0.5}
    mih={rem(80)}
    variant={"brand-subtle"}
  >
    Ok
  </Button>
  <Button
    fz={rem(32)}
    bdrs={0}
    flex={0.5}
    mih={rem(80)}
    variant={"brand-subtle"}
  >
    Cancel
  </Button>
</Group>
</Modal> */
}
