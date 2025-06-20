import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Entry } from "../utils/storage";

export default function CustomBottomSheet({
  visible,
  onClose,
  entry,
  onAfterClose,
}: {
  visible: boolean;
  onClose: () => void;
  entry: Entry | null;
  onAfterClose?: () => void;
}) {
  const [shouldRender, setShouldRender] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      sheetTranslateY.setValue(Dimensions.get("window").height);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: Dimensions.get("window").height,
          duration: 250,
          easing: Easing.in(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        if (onAfterClose) onAfterClose();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!shouldRender || !entry) return null;

  return (
    <>
      <Animated.View
        style={[styles.sheetOverlay, { opacity: overlayOpacity, zIndex: 90 }]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            zIndex: 91,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <Text style={styles.sheetMood}>{entry.mood}</Text>
        <Text style={styles.sheetDate}>
          {new Date(entry.date).toLocaleDateString()}
        </Text>
        <Text style={styles.sheetContent}>{entry.content}</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
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
    minHeight: 500,
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
});
