import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChartBottomSheet({
  visible,
  onClose,
  children,
  height = 360,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!shouldRender) return null;

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
            minHeight: height,
          },
        ]}
      >
        <View style={{ width: "100%", alignItems: "center" }}>{children}</View>
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 91,
  },
});
