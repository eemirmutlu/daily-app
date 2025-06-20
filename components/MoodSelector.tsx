import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

const MOODS = ["😃", "🙂", "😐", "😔", "😭"];
const BOX_SIZE = 56;

function MoodBox({
  mood,
  selected,
  onPress,
}: {
  mood: string;
  selected: boolean;
  onPress: () => void;
}) {
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f3f0fa", "#d1c4e9"],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.emojiContainer,
          { backgroundColor: backgroundColor as any } as ViewStyle,
        ]}
      >
        <Animated.Text style={styles.emoji}>{mood}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MoodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mood: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {MOODS.map((mood) => (
        <MoodBox
          key={mood}
          mood={mood}
          selected={value === mood}
          onPress={() => onChange(mood)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  emojiContainer: {
    marginHorizontal: 8,
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: BOX_SIZE / 2,
    backgroundColor: "#f3f0fa",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 32,
  },
});
