import { useFocusEffect } from "@react-navigation/native";
import { Info } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomBottomSheet from "../../components/CustomBottomSheet";
import JournalCard from "../../components/JournalCard";
import { Entry, getAllEntries } from "../../utils/storage";

export default function AllEntriesScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [entrySheetVisible, setEntrySheetVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getAllEntries().then(setEntries);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh entries when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      getAllEntries().then(setEntries);
    }, [])
  );

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
      <View style={styles.header}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.title}>📚 All Entries</Text>
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
                    Here you can see all your moods.
                  </Text>
                </Animated.View>
              </>
            )}
          </View>
        </View>
      </View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40 + index * 10, 0],
                    }),
                  },
                ],
                opacity: fadeAnim,
              }}
            >
              <TouchableOpacity onPress={() => openBottomSheet(item)}>
                <JournalCard entry={item} />
              </TouchableOpacity>
            </Animated.View>
          )}
          contentContainerStyle={
            entries.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyText}>No entries yet.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
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
    flexDirection: "row",
    alignItems: "center",
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
    position: "relative",
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#ede7f6",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7c4dff",
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#fff",
  },
  sheetMood: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c4dff",
    fontFamily: "Manrope",
    marginBottom: 8,
  },
  sheetDate: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Manrope",
    marginBottom: 16,
  },
  sheetContent: {
    fontSize: 18,
    color: "#888",
    fontFamily: "Manrope",
  },
  fab: {
    position: "absolute",
    right: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#7c4dff",
  },
  headerInfoBtnWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
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
