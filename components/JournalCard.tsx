import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Entry } from "../utils/storage";

export default function JournalCard({ entry }: { entry: Entry }) {
  const firstLine = entry.content.split("\n")[0];
  const date = new Date(entry.date).toLocaleDateString();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.mood}>{entry.mood}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.text} numberOfLines={1}>
          {firstLine}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f6ff",
    borderRadius: 22,
    padding: 20,
    marginVertical: 12,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ede7f6",
  },
  emojiWrap: {
    backgroundColor: "#e0c3fc",
    borderRadius: 18,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  mood: {
    fontSize: 32,
    fontFamily: "Manrope",
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Manrope",
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: "#a39fc9",
    marginTop: 4,
    fontFamily: "Manrope",
  },
});
