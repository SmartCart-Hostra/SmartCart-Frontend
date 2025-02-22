import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./(tabs)/home";  // ✅ Import from (tabs)
import ProfileScreen from "./(tabs)/profile";  // ✅ Import from (tabs)
import SettingsScreen from "./(tabs)/settings";  // ✅ Import from (tabs)

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // 🚀 Hides the top bar
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Settings") {
            iconName = "settings";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF", // Active tab color
        tabBarInactiveTintColor: "gray", // Inactive tab color
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
