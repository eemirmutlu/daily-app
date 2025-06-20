import { Tabs } from "expo-router";
import { BarChart2, BookOpen, Home, PlusCircle } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBgColor = "#fff";
  const tabBarHeight = Platform.OS === "ios" ? 80 : 60;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#e0c3fc" }}
      edges={["bottom", "left", "right"]}
    >
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: insets.bottom, backgroundColor: tabBarBgColor, zIndex: 0 }} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#7B61FF",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarStyle: {
            backgroundColor: tabBarBgColor,
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
            height: tabBarHeight,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 5,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 10,
            elevation: 5,
            position: "absolute",
            bottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            title: "New",
            tabBarIcon: ({ color, size }) => (
              <PlusCircle color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, size }) => (
              <BarChart2 color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="all-entries"
          options={{
            title: "All Entries",
            tabBarIcon: ({ color, size }) => (
              <BookOpen color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
