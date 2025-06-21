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
// Pazar son gün olacak şekilde düzenlendi
const MOOD_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MoodChart({
  entries,
  width,
  height,
}: {
  entries: Entry[];
  width?: number;
  height?: number;
}) {
  // Group entries by day of week (Monday = 0, Sunday = 6)
  const week = Array(7)
    .fill(null)
    .map(() => [] as { mood: number; date: string }[]);
  
  entries.forEach((e) => {
    const d = new Date(e.date);
    const day = d.getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    const adjustedDay = day === 0 ? 6 : day - 1;
    week[adjustedDay].push({ 
      mood: MOOD_MAP[e.mood] || 3, 
      date: e.date 
    });
  });
  
  // Get the most recent mood value for each day, or 0 if no entries
  const data = week.map((dayEntries) => {
    if (dayEntries.length === 0) return 0;
    
    // Sort by date and get the most recent entry
    const sortedEntries = dayEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedEntries[0].mood;
  });
  
  // Calculate dynamic segments based on max value
  const maxValue = Math.max(...data);
  const segments = maxValue > 0 ? maxValue : 5; // Default to 5 if no data
  
  const chartWidth = width || Dimensions.get("window").width - 32;
  const chartHeight = height || 220;
  
  return (
    <View style={{ marginLeft: 0}}>
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
        showBarTops={true}
        showValuesOnTopOfBars={true}
        chartConfig={{
          backgroundColor: "#f8f6ff",
          backgroundGradientFrom: "#f8f6ff",
          backgroundGradientTo: "#ede7f6",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
          style: { 
            borderRadius: 20,
            paddingRight: 16,
            paddingTop: 8,
          },
          propsForBackgroundLines: { 
            stroke: "#e0c3fc",
            strokeWidth: 1,
            strokeDasharray: "5,5"
          },
          propsForLabels: {
            fontSize: 14,
            fontWeight: "600",
            fontFamily: "Manrope",
          },
          propsForVerticalLabels: {
            fontSize: 12,
            fontWeight: "500",
            fontFamily: "Manrope",
          },
          propsForHorizontalLabels: {
            fontSize: 14,
            fontWeight: "bold",
            fontFamily: "Manrope",
            color: "#7c4dff",
          },
          barPercentage: 0.7,
        }}
        style={{ 
          borderRadius: 20,
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
        withInnerLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        segments={segments}
      />
    </View>
  );
}
