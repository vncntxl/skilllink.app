import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";

// simple mock data for now
const PROFILES = [
  {
    id: "1",
    name: "Vincent Xaviera Lee",
    type: "student", // student
    roleLabel: "Student",
    subject: "Programming",
  },
  {
    id: "2",
    name: "Amelia Tan",
    type: "mentor", // mentor
    roleLabel: "Mentor",
    subject: "Design",
  },
  {
    id: "3",
    name: "Jonathan Park",
    type: "mentor",
    roleLabel: "Mentor",
    subject: "Business",
  },
  {
    id: "4",
    name: "Sara Nguyen",
    type: "student",
    roleLabel: "Student",
    subject: "Languages",
  },
];

export default function ProfilesScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "mentor" | "student"

  const filteredProfiles = useMemo(() => {
    let list = PROFILES;

    if (filter === "mentor") {
      list = list.filter((p) => p.type === "mentor");
    } else if (filter === "student") {
      list = list.filter((p) => p.type === "student");
    }

    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    return list;
  }, [search, filter]);

  const handleOpenProfile = (profile) => {
    navigation.navigate("ProfileDetail", { profile });
  };

  const renderProfileCard = ({ item }) => {
    const isMentor = item.type === "mentor";

    return (
      <TouchableOpacity
        style={styles.profileCard}
        activeOpacity={0.9}
        onPress={() => handleOpenProfile(item)}
      >
        {/* Avatar */}
        <View style={styles.profileAvatarWrapper}>
          <View
            style={[
              styles.profileAvatar,
              isMentor && styles.profileAvatarMentor, // different colour
            ]}
          >
            <Ionicons
              name={isMentor ? "school-outline" : "person-outline"}
              size={26}
              color={isMentor ? Colors.primaryGreen : Colors.primaryGold}
            />
          </View>
          <View
            style={[styles.statusDot, isMentor && styles.statusDotMentor]}
          />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{item.name}</Text>

          <Text style={styles.profileSubtitle}>
            {isMentor ? "Mentor · " : "Student · "}
            {item.subject}
          </Text>

          <View style={[styles.badge, isMentor && styles.badgeMentor]}>
            <Ionicons
              name={isMentor ? "star-outline" : "book-outline"}
              size={14}
              color={isMentor ? Colors.primaryGreen : Colors.primaryGreen}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.badgeText, isMentor && styles.badgeTextMentor]}
            >
              {item.roleLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleOpenProfile(item)}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
            <Ionicons
              name="arrow-forward-outline"
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Page header */}
      <Text style={styles.title}>Discover People</Text>
      <Text style={styles.subtitle}>
        Find mentors and students who match your interests.
      </Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.textGray}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, skills, or course..."
          placeholderTextColor={Colors.textGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <FilterChip
          label="All Users"
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterChip
          label="Mentors"
          active={filter === "mentor"}
          onPress={() => setFilter("mentor")}
        />
        <FilterChip
          label="Students"
          active={filter === "student"}
          onPress={() => setFilter("student")}
        />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Ionicons
          name="funnel-outline"
          size={16}
          color={Colors.textGray}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.countText}>
          {filteredProfiles.length} profile
          {filteredProfiles.length === 1 ? "" : "s"} found
        </Text>
      </View>

      {/* List or Empty state */}
      {filteredProfiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="search-circle-outline"
            size={80}
            color={Colors.textGray}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>No profiles found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          keyExtractor={(item) => item.id}
          renderItem={renderProfileCard}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgWhite,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  countText: {
    fontSize: 12,
    color: Colors.textGray,
  },

  profileCard: {
    flexDirection: "row",
    backgroundColor: Colors.bgWhite,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },

  profileAvatarWrapper: {
    marginRight: 14,
    alignItems: "center",
  },

  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatarMentor: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryGold,
    justifyContent: "center",
    alignItems: "center",
  },

  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: Colors.bgWhite,
    backgroundColor: Colors.primaryGold,
    position: "absolute",
    bottom: 60,
    right: -5,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryGold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    padding: 10,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
