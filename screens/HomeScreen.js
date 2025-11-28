// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState("");
  const [isLoadingName, setIsLoadingName] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setName("SkillLink user");
          return;
        }

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          // prefer saved name, fallback to email, then generic
          setName(data.name || auth.currentUser.email || "SkillLink user");
        } else {
          // no user doc yet — fallback to auth info
          setName(auth.currentUser.email || "SkillLink user");
        }
      } catch (err) {
        console.log("Error loading user for Home:", err);
        setName("SkillLink user");
      } finally {
        setIsLoadingName(false);
      }
    };

    loadUser();
  }, []);

  const subjects = [
    { id: 1, name: "Design", count: 0, icon: "color-palette-outline" },
    { id: 2, name: "Programming", count: 0, icon: "laptop-outline" },
    {
      id: 3,
      name: "Business",
      count: 0,
      icon: "briefcase-outline",
    },
    {
      id: 4,
      name: "Languages",
      count: 0,
      icon: "chatbubble-ellipses-outline",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeBadge}>
          ✨ Welcome back, {isLoadingName ? "Loading..." : name}
        </Text>
        <Text style={styles.welcomeTitle}>Connect. Learn. Grow.</Text>
        <Text style={styles.welcomeQuote}>
          The capacity to learn is a gift; the ability to learn is a skill; the
          willingness to learn is a choice. — Brian Herbert
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Find Your Perfect Mentor</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={Colors.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skill, or subject"
            placeholderTextColor={Colors.textGray}
          />
        </View>
      </View>

      {/* Subjects */}
      <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>Browse by Subject</Text>
        <View style={styles.grid}>
          {subjects.map((item) => (
            <TouchableOpacity key={item.id} style={styles.subjectCard}>
              <View style={styles.subjectIconWrapper}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={Colors.primaryGold}
                />
              </View>

              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.subjectCount}>{item.count} mentors</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>

        <View style={styles.statsCard}>
          <View style={styles.statsIconCircle}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={Colors.primaryGreen}
            />
          </View>

          <View>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Active Connections</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.quickActionBtn, styles.quickActionPrimary]}
          onPress={() => navigation.navigate("Profiles")}
        >
          <Ionicons name="search-outline" size={18} color="white" />
          <Text style={[styles.quickActionText, { color: "white" }]}>
            Browse Mentors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate("Connections")}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={Colors.primaryGreen}
          />
          <Text style={styles.quickActionText}>My Connections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, styles.quickActionYellow]}
          onPress={() => navigation.navigate("Events")}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={Colors.primaryGold}
          />
          <Text style={[styles.quickActionText, { color: Colors.primaryGold }]}>
            View All Events
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  appName: { fontSize: 18, fontWeight: "700", color: Colors.textDark },
  appTagline: { fontSize: 12, color: Colors.textGray },

  welcomeCard: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  welcomeBadge: { color: Colors.primaryGold, fontSize: 12, marginBottom: 6 },
  welcomeTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  welcomeQuote: { color: "#E7F8ED", fontSize: 13, lineHeight: 18 },

  section: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },

  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  subjectCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  subjectIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  subjectName: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  subjectCount: { fontSize: 12, color: Colors.textGray },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.softYellowBg,
    borderRadius: 14,
    padding: 14,
  },

  statsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softGreenBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  statsNumber: { fontSize: 20, fontWeight: "700", color: Colors.textDark },
  statsLabel: { fontSize: 13, color: Colors.textGray },

  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    marginBottom: 10,
    gap: 8,
  },

  quickActionPrimary: {
    backgroundColor: Colors.primaryGreen,
  },

  quickActionYellow: {
    borderColor: Colors.primaryGold,
    backgroundColor: Colors.softYellowBg,
  },

  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
