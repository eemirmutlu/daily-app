import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useRouter } from "expo-router";
import { Info, PlusCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomBottomSheet from "../../components/CustomBottomSheet";
import JournalCard from "../../components/JournalCard";
import { Entry, getEntriesByWeek } from "../../utils/storage";

dayjs.extend(isoWeek);

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function HomeScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [entrySheetVisible, setEntrySheetVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState("");
  const [greetingEmoji, setGreetingEmoji] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    function updateGreetingAndTime() {
      const now = new Date();
      const hour = now.getHours();
      let greet = "";
      let emoji = "";
      if (hour >= 7 && hour < 12) {
        greet = "Good Morning";
        emoji = "🌅";
      } else if (hour >= 12 && hour < 18) {
        greet = "Good Afternoon";
        emoji = "☀️";
      } else if (hour >= 18 && hour < 21) {
        greet = "Good Evening";
        emoji = "🌇";
      } else {
        greet = "Good Night";
        emoji = "🌙";
      }
      setGreeting(greet);
      setGreetingEmoji(emoji);
      setDateTime(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }) +
          " - " +
          now.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    }
    updateGreetingAndTime();
    const interval = setInterval(updateGreetingAndTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refresh entries when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      getEntriesByWeek().then(setEntries);
    }, [])
  );

  useEffect(() => {
    if (entrySheetVisible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [entrySheetVisible]);

  const openBottomSheet = (entry: Entry) => {
    setSelectedEntry(entry);
    setEntrySheetVisible(true);
  };

  const closeBottomSheet = () => {
    setEntrySheetVisible(false);
  };

  const handleAfterClose = () => {
    setSelectedEntry(null);
  };

  // Haftanın başından 7 gün oluştur (Pazartesi-Pazar)
  const today = dayjs();
  const startOfWeek = today.startOf("isoWeek"); // Pazartesi başlangıç
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day")
  );

  const handleInfoPress = () => {
    if (!tooltipVisible) {
      setTooltipVisible(true);
      tooltipAnim.setValue(0);
      Animated.timing(tooltipAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tooltipAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setTooltipVisible(false));
    }
  };

  const handleTooltipOverlay = () => {
    Animated.timing(tooltipAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setTooltipVisible(false));
  };

  return (
    <View style={styles.bg}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 26, marginRight: 6 }}>
              {greetingEmoji}
            </Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          <View style={styles.headerInfoBtnWrap}>
            <TouchableOpacity
              style={styles.statsInfoBtn}
              onPress={handleInfoPress}
            >
              <Info color="#7c4dff" size={22} />
            </TouchableOpacity>
            {tooltipVisible && (
              <>
                <TouchableOpacity
                  style={styles.tooltipOverlay}
                  activeOpacity={1}
                  onPress={handleTooltipOverlay}
                />
                <Animated.View
                  style={[
                    styles.tooltip,
                    styles.tooltipBottomLeft,
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
                  <Text style={styles.tooltipText}>
                    Only your moods for this week are shown here.
                  </Text>
                </Animated.View>
              </>
            )}
          </View>
        </View>
        <Text style={styles.date}>{dateTime}</Text>
      </Animated.View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.weekList}
          showsVerticalScrollIndicator={false}
        >
          {daysOfWeek.map((date, idx) => {
            const entry = entries.find((e) =>
              dayjs(e.date).isSame(date, "day")
            );
            const isToday = date.isSame(today, "day");
            const weekDayIdx = date.day() === 0 ? 6 : date.day() - 1; // Pazartesi=0, Pazar=6
            return (
              <View
                key={date.format("YYYY-MM-DD")}
                style={{ marginBottom: 12 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Text style={styles.dayLabel}>
                    {WEEK_DAYS[weekDayIdx]} - {date.format("D MMMM")}
                  </Text>
                </View>
                {entry ? (
                  <TouchableOpacity onPress={() => openBottomSheet(entry)}>
                    <JournalCard entry={entry} />
                  </TouchableOpacity>
                ) : isToday ? (
                  <TouchableOpacity
                    style={styles.addTodayContainer}
                    onPress={() => router.push("/(tabs)/new")}
                    activeOpacity={0.85}
                  >
                    <View style={styles.addTodayIconWrap}>
                      <Text style={styles.addTodayIcon}>+</Text>
                    </View>
                    <Text style={styles.addTodayText}>
                      Let&apos;s add your mood for today!
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.moodPrompt}>
                    You forgot to log your mood this day. 😔
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/new")}
      >
        <PlusCircle color="#fff" size={36} />
      </TouchableOpacity>
      <CustomBottomSheet
        visible={entrySheetVisible}
        onClose={closeBottomSheet}
        entry={selectedEntry}
        onAfterClose={handleAfterClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#e0c3fc",
  },
  header: {
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
    alignItems: "flex-start",
    position: "relative",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7c4dff",
    fontFamily: "Manrope",
    marginBottom: 2,
  },
  date: {
    fontSize: 15,
    color: "#888",
    marginBottom: 8,
    fontFamily: "Manrope",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Manrope",
    marginBottom: 0,
  },
  list: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 100,
    backgroundColor: "#9575cd",
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Manrope",
    textAlign: "center",
    maxWidth: 260,
  },
  sheetOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
    zIndex: 1,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 220,
    flex: 0,
    padding: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#fff",
    zIndex: 91,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetMood: {
    fontSize: 48,
    marginBottom: 8,
  },
  sheetDate: {
    fontSize: 16,
    color: "#7c4dff",
    marginBottom: 16,
    fontFamily: "Manrope",
  },
  sheetContent: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Manrope",
    textAlign: "center",
  },
  weekList: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 100,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7c4dff",
    fontFamily: "Manrope",
  },
  moodPrompt: {
    fontSize: 16,
    color: "#b39ddb",
    fontFamily: "Manrope",
    paddingVertical: 8,
    textAlign: "left",
  },
  addTodayContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    alignSelf: "flex-start",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  addTodayIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addTodayIcon: {
    color: "#7c4dff",
    fontSize: 22,
    fontWeight: "bold",
  },
  addTodayText: {
    color: "#7c4dff",
    fontSize: 16,
    fontFamily: "Manrope",
    fontWeight: "600",
  },
  headerInfoBtnWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
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
  },
  tooltipOverlay: {
    position: "absolute",
    top: -24,
    left: -1000,
    right: -1000,
    bottom: -24,
    zIndex: 10,
  },
  tooltip: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ede7f6",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 220,
    zIndex: 30,
  },
  tooltipBottomLeft: {
    position: "absolute",
    left: -240,
    top: 36,
    minWidth: 240,
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
  tooltipText: {
    color: "#7c4dff",
    fontSize: 15,
    fontFamily: "Manrope",
    textAlign: "center",
    flexWrap: "wrap",
  },
});
