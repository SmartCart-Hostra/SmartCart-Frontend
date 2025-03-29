import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./(tabs)/home";  // ✅ Import from (tabs)
import SettingsScreen from "./(tabs)/settings";  // ✅ Import from (tabs)
import SavedRecipesScreen from "./(tabs)/savedRecipesScreen";  // ✅ Import saved recipes

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarStyle: {
          backgroundColor: "#F8F3E6",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Profile: "person",
            "Saved Recipes": "heart",
            Settings: "settings",
          };

          const iconName = iconMap[route.name] || "help-circle"; // ✅ Default fallback icon

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Saved Recipes" component={SavedRecipesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
