import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router"; // 🚀 Expo Router manages navigation
import HomeScreen from "./home";
import ProfileScreen from "./profile";
import SettingsScreen from "./settings";

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "home") {
            iconName = "home";
          } else if (route.name === "profile") {
            iconName = "person";
          } else if (route.name === "settings") {
            iconName = "settings";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
      <Tab.Screen name="settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
