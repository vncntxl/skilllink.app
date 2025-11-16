// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./styles/colors";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfilesScreen from "./screens/ProfilesScreen";
import ProfileDetailScreen from "./screens/ProfileDetailScreen";

// Simple placeholder screens for now
import { View, Text } from "react-native";

function PlaceholderScreen({ title }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{title} screen coming soon</Text>
    </View>
  );
}

function EventsScreen() {
  return <PlaceholderScreen title="Events" />;
}
function ConnectionsScreen() {
  return <PlaceholderScreen title="Connections" />;
}
function FeedbackScreen() {
  return <PlaceholderScreen title="Feedback" />;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator (like your design)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1D6F42",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 60,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Profiles") iconName = "people-outline";
          else if (route.name === "Events") iconName = "calendar-outline";
          else if (route.name === "Connections") iconName = "link-outline";
          else if (route.name === "Feedback")
            iconName = "chatbubble-ellipses-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileDetail"
          component={ProfileDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
