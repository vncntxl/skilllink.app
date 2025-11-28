// screens/ProfilesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export default function ProfilesScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "mentor" | "student"
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  // -----------------------------
  // Load users + connections
  // -----------------------------
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchConnections()]);
      } catch (err) {
        console.log("Profiles load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchUsers = async () => {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);

    const list = snap.docs
      .filter((doc) => doc.id !== currentUser.uid) // hide yourself
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setUsers(list);
  };

  const fetchConnections = async () => {
    if (!currentUser) return;

    const connectionsRef = collection(db, "connections");

    const q1 = query(
      connectionsRef,
      where("requesterId", "==", currentUser.uid)
    );
    const q2 = query(
      connectionsRef,
      where("receiverId", "==", currentUser.uid)
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const list = [
      ...snap1.docs.map((d) => ({ id: d.id, ...d.data() })),
      ...snap2.docs.map((d) => ({ id: d.id, ...d.data() })),
    ];

    setConnections(list);
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const getConnectionState = (otherUserId) => {
    if (!currentUser) return { state: "none" };

    const existing = connections.find(
      (c) =>
        (c.requesterId === currentUser.uid && c.receiverId === otherUserId) ||
        (c.requesterId === otherUserId && c.receiverId === currentUser.uid)
    );

    if (!existing) return { state: "none" };

    if (existing.status === "accepted") {
      return { state: "accepted" };
    }

    if (existing.status === "pending") {
      if (existing.requesterId === currentUser.uid) {
        return { state: "pendingOutgoing" }; // you sent it
      } else {
        return { state: "pendingIncoming" }; // they sent it to you
      }
    }

    return { state: existing.status }; // declined etc.
  };

  const handleConnect = async (otherUser) => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    const { state } = getConnectionState(otherUser.id);

    if (state === "accepted") {
      Alert.alert("Already connected", "You are already connected.");
      return;
    }
    if (state === "pendingOutgoing") {
      Alert.alert("Request pending", "You have already sent a request.");
      return;
    }
    if (state === "pendingIncoming") {
      Alert.alert(
        "Request already received",
        "Check the Connections tab to respond."
      );
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "connections"), {
        requesterId: currentUser.uid,
        receiverId: otherUser.id,
        status: "pending",
        createdAt: new Date(),
      });

      setConnections((prev) => [
        ...prev,
        {
          id: docRef.id,
          requesterId: currentUser.uid,
          receiverId: otherUser.id,
          status: "pending",
        },
      ]);

      Alert.alert(
        "Request sent",
        `Connection request sent to ${otherUser.name || "this user"}.`
      );
    } catch (err) {
      console.log("Connect error:", err);
      Alert.alert("Error", "Could not send request.");
    }
  };

  const handleOpenProfile = (user) => {
    navigation.navigate("ProfileDetail", { profile: user });
  };

  // Apply role filter
  const filteredUsers = users.filter((u) => {
    if (filter === "mentor") return (u.role || "").toLowerCase() === "mentor";
    if (filter === "student") return (u.role || "").toLowerCase() === "student";
    return true;
  });

  // -----------------------------
  // UI render
  // -----------------------------
  const renderProfileCard = ({ item }) => {
    const role = (item.role || "").toLowerCase();
    const isMentor = role === "mentor";
    const subject = item.subject || item.category || "General";

    const { state } = getConnectionState(item.id);

    let buttonLabel = "Connect";
    let buttonStyle = styles.connectButton;
    let buttonTextStyle = styles.connectButtonText;
    let buttonDisabled = false;
    let iconName = "person-add-outline";

    if (state === "accepted") {
      buttonLabel = "Connected";
      buttonStyle = styles.connectedButton;
      buttonTextStyle = styles.connectedButtonText;
      buttonDisabled = true;
      iconName = "checkmark-circle-outline";
    } else if (state === "pendingOutgoing") {
      buttonLabel = "Pending";
      buttonStyle = styles.pendingButton;
      buttonTextStyle = styles.pendingButtonText;
      buttonDisabled = true;
      iconName = "time-outline";
    } else if (state === "pendingIncoming") {
      buttonLabel = "Respond in Connections";
      buttonStyle = styles.pendingButton;
      buttonTextStyle = styles.pendingButtonText;
      buttonDisabled = true;
      iconName = "mail-unread-outline";
    }

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
              isMentor && styles.profileAvatarMentor,
            ]}
          >
            <Ionicons
              name={isMentor ? "school-outline" : "person-outline"}
              size={26}
              color={isMentor ? Colors.primaryGreen : Colors.primaryGold}
            />
          </View>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>
            {item.name || item.email || "SkillLink user"}
          </Text>

          <Text style={styles.profileSubtitle}>
            {isMentor ? "Mentor · " : "Student · "}
            {subject}
          </Text>

          <View style={[styles.badge, isMentor && styles.badgeMentor]}>
            <Ionicons
              name={isMentor ? "star-outline" : "book-outline"}
              size={14}
              color={isMentor ? Colors.primaryGold : Colors.primaryGreen}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.badgeText, isMentor && styles.badgeTextMentor]}
            >
              {isMentor ? "Mentor" : "Student"}
            </Text>
          </View>

          <TouchableOpacity
            style={buttonStyle}
            onPress={() => handleConnect(item)}
            disabled={buttonDisabled}
          >
            <Ionicons
              name={iconName}
              size={18}
              color={buttonTextStyle.color}
              style={{ marginRight: 4 }}
            />
            <Text style={buttonTextStyle}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mentors & Students</Text>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "all" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === "all" && styles.filterPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "mentor" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("mentor")}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === "mentor" && styles.filterPillTextActive,
              ]}
            >
              Mentors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "student" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("student")}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === "student" && styles.filterPillTextActive,
              ]}
            >
              Students
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>
            Once more people join SkillLink, they will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderProfileCard}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 10,
  },
  filterPills: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB55",
    borderRadius: 999,
    padding: 3,
    alignSelf: "flex-start",
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 4,
  },
  filterPillActive: {
    backgroundColor: Colors.bgWhite,
  },
  filterPillText: {
    fontSize: 12,
    color: Colors.textGray,
    fontWeight: "500",
  },
  filterPillTextActive: {
    color: Colors.textDark,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },
  profileAvatarWrapper: {
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarMentor: {
    backgroundColor: Colors.primaryGold,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  profileSubtitle: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryGold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeMentor: {
    backgroundColor: "#ECFDF3",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  badgeTextMentor: {
    color: Colors.primaryGreen,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryGreen,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.textGray,
  },
  pendingButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  connectedButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  connectedButtonText: {
    color: Colors.primaryGreen,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
