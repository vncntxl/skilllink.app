import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";

const TABS = ["All (0)", "Pending (0)", "Active (0)"];

export default function ConnectionsScreen() {
  const [activeTab, setActiveTab] = useState("All (0)");

  const connections = []; // empty, so we show the empty state

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.title}>My Connections</Text>
        <Text style={styles.subtitle}>
          Manage your mentorship relationships
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

      {/* Empty state */}
      {connections.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emoji}>🤝</Text>
          <Text style={styles.emptyTitle}>No connections yet</Text>
          <Text style={styles.emptySubtitle}>
            Start connecting with mentors or students!
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
    paddingTop: 48,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
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
