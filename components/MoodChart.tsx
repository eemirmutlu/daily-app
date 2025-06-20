import React from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Entry } from "../utils/storage";

const MOOD_MAP: Record<string, number> = {
  "😃": 5,
  "🙂": 4,
  "😐": 3,
  "😔": 2,
  "😭": 1,
};
const MOOD_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MoodChart({
  entries,
  width,
  height,
}: {
  entries: Entry[];
  width?: number;
  height?: number;
}) {
  // Group entries by day of week
  const week = Array(7)
    .fill(null)
    .map(() => [] as number[]);
  entries.forEach((e) => {
    const d = new Date(e.date);
    const day = d.getDay();
    week[day].push(MOOD_MAP[e.mood] || 3);
  });
  const data = week.map((arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  );
  const chartWidth = width || Dimensions.get("window").width - 32;
  const chartHeight = height || 220;
  return (
    <View>
      <BarChart
        data={{
          labels: MOOD_LABELS,
          datasets: [{ data }],
        }}
        yAxisLabel=""
        width={chartWidth}
        height={chartHeight}
        yAxisSuffix=""
        fromZero
        chartConfig={{
          backgroundColor: "#f3f0fa",
          backgroundGradientFrom: "#f3f0fa",
          backgroundGradientTo: "#e1bee7",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(149, 117, 205, ${opacity})`,
          labelColor: () => "#888",
          style: { borderRadius: 16 },
          propsForBackgroundLines: { stroke: "#e0e0e0" },
        }}
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
