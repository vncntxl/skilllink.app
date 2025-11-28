import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfilesScreen from "./screens/ProfilesScreen";
import ProfileDetailScreen from "./screens/ProfileDetailScreen";
import EventsScreen from "./screens/EventsScreen";
import ConnectionsScreen from "./screens/ConnectionsScreen";
import FeedbackScreen from "./screens/FeedbackScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1D6F42",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: { height: 60, paddingTop: 6 },

        tabBarIcon: ({ color, size }) => {
          let icon;

          switch (route.name) {
            case "Home":
              icon = "home-outline";
              break;
            case "Profiles":
              icon = "people-outline";
              break;
            case "Events":
              icon = "calendar-outline";
              break;
            case "Connections":
              icon = "link-outline";
              break;
            case "Feedback":
              icon = "chatbubble-ellipses-outline";
              break;
          }

          return <Ionicons name={icon} size={size} color={color} />;
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FIX: NO AWAIT OUTSIDE FUNCTION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null; // prevents blank screen flicker

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
