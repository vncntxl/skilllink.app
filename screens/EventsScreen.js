import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";

const TABS = ["Upcoming", "My Events", "Past"];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState("Upcoming");

  const events = []; // empty for now -> shows empty state

  return (
    <View style={styles.container}>
      {/* Page title */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={Colors.primaryGreen}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.title}>Mentoring Events</Text>
        </View>
        <Text style={styles.subtitle}>
          Join workshops, Q&As, and networking sessions
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* For now always show empty state */}
      {events.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-clear-outline"
            size={80}
            color={Colors.textGray}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for upcoming events.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  appTagline: {
    fontSize: 11,
    color: Colors.textGray,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB33",
    borderRadius: 999,
    padding: 3,
    marginTop: 16,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: Colors.bgWhite,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: Colors.textDark,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: "center",
  },
});
