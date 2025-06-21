import * as MediaLibrary from 'expo-media-library';
import { Download, Share2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const chartRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();
  
  // Calculate our own navigation height
  const navigationHeight = Platform.OS === "ios" ? 80 : 60;

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

  const captureAndShare = async (platform?: string) => {
    try {
      
      if (chartRef.current && chartRef.current.capture) {
        
        const uri = await chartRef.current.capture();
        
        if (platform) {
          // Platform-specific sharing
          const shareOptions = {
            title: "Mood Chart",
            message: "Check out my mood chart! 📊",
            url: uri,
          };
          
          
          switch (platform) {
            case 'whatsapp':
              await Share.share({
                ...shareOptions,
                message: `${shareOptions.message}\n\n${uri}`,
              });
              break;
            case 'twitter':
              await Share.share({
                ...shareOptions,
                message: `${shareOptions.message} #MoodTracking #MentalHealth`,
              });
              break;
            case 'instagram':
              await Share.share({
                ...shareOptions,
                message: `${shareOptions.message}\n\n${uri}`,
              });
              break;
            default:
              await Share.share(shareOptions);
          }
        } else {
          // General share
          await Share.share({
            title: "Mood Chart",
            message: "Check out my mood chart! 📊",
            url: uri,
          });
        }
      } else {
        Alert.alert("Error", "Chart capture not available");
      }
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", "Failed to capture or share the chart");
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save photos to your gallery.');
        return;
      }

      if (!chartRef.current || !chartRef.current.capture) {
        Alert.alert('Error', 'Chart reference not found');
        return;
      }

      const uri = await chartRef.current.capture();

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Mood Charts', asset, false);
      
      Alert.alert('Success', 'Chart saved to gallery! 📸');
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'Failed to save chart to gallery');
    } finally {
      setIsDownloading(false);
    }
  };

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
            paddingBottom: 60 + navigationHeight,
          },
        ]}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          <ViewShot ref={chartRef} style={styles.chartContainer}>
            {children}
          </ViewShot>
          
          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator color="#7c4dff" size={20} />
              ) : (
                <Download color="#7c4dff" size={20} />
              )}
              <Text style={styles.buttonText}>
                {isDownloading ? 'Saving...' : 'Download as PNG'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => captureAndShare()}
            >
              <Share2 color="#7c4dff" size={20} />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 1,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f8f6ff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 91,
    shadowColor: "#b8b8ff",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginRight: 10,
    minWidth: 450,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(124, 77, 255, 0.2)",
    width: "60%",
    justifyContent: "center",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#7c4dff",
    fontFamily: "Manrope",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(124, 77, 255, 0.2)",
    width: "35%",
    justifyContent: "center",
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 400,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});
