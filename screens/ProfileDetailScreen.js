import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";

export default function ProfileDetailScreen({ route, navigation }) {
  const { profile } = route.params;

  return (
    <View style={styles.container}>
      {/* Back link */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back-outline"
          size={18}
          color={Colors.textDark}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.backText}>Back to Profiles</Text>
      </TouchableOpacity>

      {/* Profile card */}
      <View style={styles.card}>
        <View style={styles.headerArea} />

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={32}
              color={Colors.primaryGold}
            />
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.name}</Text>

              <View style={styles.badge}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color={Colors.bgLight}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.badgeText}>{profile.roleLabel}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mail-outline" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Placeholder extra fields you can expand later */}
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.aboutText}>This is {profile.name}. Hello!</Text>
        </View>
      </View>
    </View>
  );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    fontSize: 13,
    color: Colors.textDark,
  },
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerArea: {
    height: 90,
    backgroundColor: Colors.primaryGreen,
  },
  avatarWrapper: {
    position: "absolute",
    top: 45,
    left: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 3,
    borderColor: Colors.bgWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryGold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 18,
  },
});
