import { useFocusEffect } from "@react-navigation/native";
import { Info } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ChartBottomSheet from "../../components/ChartBottomSheet";
import MoodChart from "../../components/MoodChart";
import { Entry, getEntriesByWeek } from "../../utils/storage";

const MOOD_MAP: Record<string, number> = {
  "😃": 5,
  "🙂": 4,
  "😐": 3,
  "😔": 2,
  "😭": 1,
};
const MOOD_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatsScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartSheetVisible, setChartSheetVisible] = useState(false);
  const [shouldRenderSheet, setShouldRenderSheet] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getEntriesByWeek().then((e) => {
      setEntries(e);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setTooltipVisible(false);
      tooltipAnim.setValue(0);
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      // Refresh entries on focus
      getEntriesByWeek().then((e) => {
        setEntries(e);
        setLoading(false);
      });
    }, [])
  );

  const showTooltip = () => {
    setTooltipVisible(true);
    tooltipAnim.setValue(0);
    Animated.timing(tooltipAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 7000);
  };

  const closeTooltip = () => {
    setTooltipVisible(false);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  };

  const openBottomSheet = () => {
    setShouldRenderSheet(true);
    setChartSheetVisible(true);
    closeTooltip();
  };

  const closeBottomSheet = () => {
    setChartSheetVisible(false);
    setTimeout(() => setShouldRenderSheet(false), 350); // Wait for animation
  };

  // Chart width logic
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48;
  const chartHeight = 220;
  const bottomSheetChartWidth = Math.max(screenWidth * 1.5, 700);
  const bottomSheetChartHeight = 320;

  // Calculate summary
  const moodValues = entries.map((e) => MOOD_MAP[e.mood] || 3);
  const avgMood = moodValues.length
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    : 0;
  let bestDay = "",
    worstDay = "";
  if (entries.length) {
    const byDay = Array(7)
      .fill(null)
      .map(() => [] as number[]);
    entries.forEach((e) => {
      const d = new Date(e.date).getDay();
      byDay[d].push(MOOD_MAP[e.mood] || 3);
    });
    const avgs = byDay.map((arr) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    );
    const max = Math.max(...avgs),
      min = Math.min(...avgs);
    bestDay = MOOD_LABELS[avgs.indexOf(max)];
    worstDay = MOOD_LABELS[avgs.indexOf(min)];
  }

  return (
    <View style={styles.gradientBg}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Stats</Text>
        <View style={styles.headerInfoBtnWrap}>
          <TouchableOpacity style={styles.statsInfoBtn} onPress={showTooltip}>
            <Info color="#7c4dff" size={22} />
          </TouchableOpacity>
          {tooltipVisible && (
            <>
              <TouchableOpacity
                style={styles.statsTooltipOverlay}
                activeOpacity={1}
                onPress={closeTooltip}
              />
              <Animated.View
                style={[
                  styles.statsTooltip,
                  styles.statsTooltipBottomLeft,
                  {
                    opacity: tooltipAnim,
                    transform: [
                      {
                        scale: tooltipAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.speechArrowBottomLeft} />
                <Text style={styles.statsTooltipText}>
                  Long press the chart to see details
                </Text>
              </Animated.View>
            </>
          )}
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { marginTop: 24 }]}
      >
        <View style={styles.card}>
          <Pressable onLongPress={openBottomSheet}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ minWidth: chartWidth }}
            >
              <View style={{ width: chartWidth }}>
                <MoodChart
                  entries={entries}
                  width={chartWidth}
                  height={chartHeight}
                />
              </View>
            </ScrollView>
          </Pressable>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Average mood:{" "}
              <Text style={styles.summaryValue}>{avgMood.toFixed(2)}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Best day: <Text style={styles.summaryValue}>{bestDay}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Toughest day: <Text style={styles.summaryValue}>{worstDay}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      {shouldRenderSheet && (
        <ChartBottomSheet
          visible={chartSheetVisible}
          onClose={closeBottomSheet}
          height={bottomSheetChartHeight + 200}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#7c4dff",
              fontFamily: "Manrope",
              marginBottom: 18,
            }}
          >
            Detailed Mood Chart
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ minWidth: bottomSheetChartWidth }}
          >
            <View style={{ width: bottomSheetChartWidth }}>
              <MoodChart
                entries={entries}
                width={bottomSheetChartWidth}
                height={bottomSheetChartHeight}
              />
            </View>
          </ScrollView>
        </ChartBottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    backgroundColor: "#e0c3fc",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7c4dff",
    fontFamily: "Manrope",
  },
  headerInfoBtnWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  card: {
    width: "100%",
    backgroundColor: "#f8f6ff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 32,
  },
  summary: {
    marginTop: 24,
    backgroundColor: "#ede7f6",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryText: {
    fontSize: 18,
    color: "#7c4dff",
    fontFamily: "Manrope",
    marginBottom: 8,
    textAlign: "center",
  },
  summaryValue: {
    color: "#333",
    fontWeight: "bold",
    fontFamily: "Manrope",
    fontSize: 18,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0c3fc",
  },
  sheetContainer: {
    zIndex: 100,
    elevation: 100,
  },
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandle: {
    backgroundColor: "#e0c3fc",
    width: 60,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "center",
  },
  bottomSheet: {
    padding: 28,
    minHeight: 220,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c4dff",
    fontFamily: "Manrope",
    marginBottom: 18,
  },
  statsTooltip: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ede7f6",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
    marginTop: 18,
    marginBottom: 8,
    alignItems: "center",
    zIndex: 1000,
  },
  statsTooltipText: {
    color: "#7c4dff",
    fontSize: 15,
    fontFamily: "Manrope",
    textAlign: "center",
  },
  speechArrow: {
    position: "absolute",
    top: -10,
    left: "50%",
    marginLeft: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#fff",
  },
  statsInfoBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#ede7f6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginLeft: 8,
  },
  statsTooltipOverlay: {
    position: "absolute",
    top: -24,
    left: -1000,
    right: -1000,
    bottom: -24,
    zIndex: 10,
  },
  statsTooltipBottomLeft: {
    position: "absolute",
    left: -220,
    top: 36,
    minWidth: 220,
    zIndex: 1001,
    elevation: 21,
  },
  speechArrowBottomLeft: {
    position: "absolute",
    top: -10,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#fff",
    zIndex: 1002,
    elevation: 22,
  },
});
