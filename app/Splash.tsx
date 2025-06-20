import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const EMOJIS = ["😊", "😃", "📝", "📊", "🌈"];
const RADIUS = 60;

export default function Splash() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    const timeout = setTimeout(() => {
      router.replace("/(tabs)");
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  const angleStep = (2 * Math.PI) / EMOJIS.length;

  return (
    <View style={styles.bg}>
      <Animated.View
        style={[
          styles.emojiCircle,
          {
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        {EMOJIS.map((emoji, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;
          return (
            <Animated.Text
              key={emoji}
              style={[
                styles.emoji,
                {
                  position: "absolute",
                  left: 70 + x,
                  top: 70 + y,
                },
              ]}
            >
              {emoji}
            </Animated.Text>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#e0c3fc",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircle: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: {
    fontSize: 38,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
});
