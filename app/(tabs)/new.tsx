import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MoodSelector from "../../components/MoodSelector";
import { Entry, getAllEntries } from "../../utils/storage";

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default function NewEntryScreen() {
  const [mood, setMood] = useState("");
  const [content, setContent] = useState("");
  const [todayEntryId, setTodayEntryId] = useState<string | null>(null);
  const router = useRouter();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  // On focus, check if there is an entry for today
  useFocusEffect(
    React.useCallback(() => {
      const checkTodayEntry = async () => {
        const entries = await getAllEntries();
        const today = new Date();
        const found = entries.find((e) => isSameDay(new Date(e.date), today));
        if (found) {
          setMood(found.mood);
          setContent(found.content);
          setTodayEntryId(found.id);
        } else {
          setMood("");
          setContent("");
          setTodayEntryId(null);
        }
      };
      checkTodayEntry();
    }, [])
  );

  const handleSave = async () => {
    if (!mood || !content.trim()) {
      Alert.alert("Please select a mood and write something.");
      return;
    }
    
    const today = new Date();
    
    let entry: Entry;
    // Remove all entries for today
    const entries = await getAllEntries();
    const filtered = entries.filter((e) => !isSameDay(new Date(e.date), today));
    
    if (todayEntryId) {
      // Update today's entry
      entry = {
        id: todayEntryId,
        mood,
        content,
        date: today.toISOString(),
      };
    } else {
      // New entry for today
      entry = {
        id: Date.now().toString(),
        mood,
        content,
        date: today.toISOString(),
      };
    }
    
    const newEntries = [entry, ...filtered];
    await AsyncStorage.setItem(
      "mood_journal_entries",
      JSON.stringify(newEntries)
    );
    
    // Use replace to force refresh of the home screen
    router.replace("/(tabs)");
  };

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
    <KeyboardAvoidingView
      style={styles.bg}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 New Entry</Text>
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
                <Text style={styles.tooltipText}>
                  If you have already entered a mood today, you can only update
                  it for now :)
                </Text>
              </Animated.View>
            </>
          )}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodCard}>
            <MoodSelector value={mood} onChange={setMood} />
          </View>
          <Text style={styles.label}>Journal</Text>
          <ScrollView 
            style={styles.inputContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <TextInput
              style={styles.input}
              multiline
              placeholder="Write about your day..."
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              placeholderTextColor="#b8b8ff"
            />
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>
            {todayEntryId ? "Update" : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#e0c3fc",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#f8f6ff",
    borderRadius: 32,
    padding: 28,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(124, 77, 255, 0.1)",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7c4dff",
    fontFamily: "Manrope",
    marginBottom: 8,
    marginTop: 8,
  },
  moodCard: {
    backgroundColor: "#ede7f6",
    borderRadius: 18,
    paddingVertical: 10,
    marginBottom: 18,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    minHeight: 100,
    maxHeight: 200,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: "transparent",
    borderRadius: 18,
    minHeight: 100,
    padding: 16,
    fontSize: 16,
    fontFamily: "Manrope",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#9575cd",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 60,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily: "Manrope",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Manrope",
    textAlign: "center",
    maxWidth: 260,
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
  tooltipText: {
    color: "#7c4dff",
    fontSize: 15,
    fontFamily: "Manrope",
    textAlign: "center",
    flexWrap: "wrap",
  },
  infoBtnWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
  },
  tooltipOverlay: {
    position: "absolute",
    top: -24,
    left: -1000,
    right: -1000,
    bottom: -24,
    zIndex: 10,
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
});
