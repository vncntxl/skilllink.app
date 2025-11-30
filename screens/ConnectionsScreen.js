import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Colors } from "../styles/colors";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
];

export default function ConnectionsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);

      const uid = currentUser.uid;
      const ref = collection(db, "connections");

      const [snapReq, snapRec] = await Promise.all([
        getDocs(query(ref, where("requesterId", "==", uid))),
        getDocs(query(ref, where("receiverId", "==", uid))),
      ]);

      const rawConns = [
        ...snapReq.docs.map((d) => ({ id: d.id, ...d.data() })),
        ...snapRec.docs.map((d) => ({ id: d.id, ...d.data() })),
      ];

      // collect all other user ids
      const otherIds = [
        ...new Set(
          rawConns.map((c) =>
            c.requesterId === uid ? c.receiverId : c.requesterId
          )
        ),
      ];

      // fetch users
      const userDocs = await Promise.all(
        otherIds.map((id) => getDoc(doc(db, "users", id)))
      );

      const userMap = {};
      userDocs.forEach((snap) => {
        if (snap.exists()) {
          userMap[snap.id] = { id: snap.id, ...snap.data() };
        }
      });

      const enriched = rawConns.map((c) => {
        const otherUserId =
          c.requesterId === uid ? c.receiverId : c.requesterId;
        return {
          ...c,
          otherUserId,
          otherUser: userMap[otherUserId] || null,
          isIncoming: c.receiverId === uid,
        };
      });

      setConnections(enriched);
    } catch (err) {
      console.log("loadConnections error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (connId, status) => {
    try {
      const ref = doc(db, "connections", connId);
      await updateDoc(ref, { status });

      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, status } : c))
      );
    } catch (err) {
      console.log("update status error:", err);
    }
  };

  const handleOpenChat = (conn) => {
    const other = conn.otherUser || {};
    const name =
      other.fullName ||
      other.name ||
      other.displayName ||
      other.email ||
      "SkillLink user";

    navigation.navigate("Chat", {
      connectionId: conn.id,
      otherUserId: conn.otherUserId,
      otherUserName: name,
    });
  };

  const counts = useMemo(() => {
    const pending = connections.filter((c) => c.status === "pending").length;
    const active = connections.filter((c) => c.status === "accepted").length;
    return {
      all: connections.length,
      pending,
      active,
    };
  }, [connections]);

  const visibleConnections = useMemo(() => {
    if (selectedTab === "pending") {
      return connections.filter((c) => c.status === "pending");
    }
    if (selectedTab === "active") {
      return connections.filter((c) => c.status === "accepted");
    }
    return connections;
  }, [connections, selectedTab]);

  const renderConnection = ({ item }) => {
    const other = item.otherUser || {};
    const name =
      other.fullName ||
      other.name ||
      other.displayName ||
      other.email ||
      "SkillLink user";

    const role = (other.role || "").toLowerCase();
    const isMentor = role === "mentor";
    const subject = other.subject || other.category || "General";

    const isPending = item.status === "pending";
    const isActive = item.status === "accepted";
    const directionLabel = item.isIncoming ? "Requested by" : "You requested";

    const showActions = isPending && item.isIncoming;

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.avatar,
              isMentor ? styles.avatarMentor : styles.avatarStudent,
            ]}
          >
            <Ionicons
              name={isMentor ? "school-outline" : "person-outline"}
              size={22}
              color={isMentor ? Colors.primaryGreen : Colors.primaryGold}
            />
          </View>

          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>
              {isMentor ? "Mentor · " : "Student · "}
              {subject}
            </Text>

            <View
              style={[styles.roleBadge, isMentor && styles.roleBadgeMentor]}
            >
              <Ionicons
                name={isMentor ? "star-outline" : "book-outline"}
                size={13}
                color={isMentor ? Colors.primaryGreen : Colors.primaryGold}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  isMentor && styles.roleBadgeTextMentor,
                ]}
              >
                {isMentor ? "Mentor" : "Student"}
              </Text>
            </View>

            <Text style={styles.directionText}>{directionLabel}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View
            style={[
              styles.statusPill,
              isPending && styles.pendingPill,
              isActive && styles.activePill,
            ]}
          >
            <Text style={styles.statusText}>
              {isPending ? "Pending" : isActive ? "Active" : item.status}
            </Text>
          </View>

          {showActions && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleUpdateStatus(item.id, "accepted")}
              >
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => handleUpdateStatus(item.id, "declined")}
              >
                <Ionicons
                  name="close"
                  size={14}
                  color={Colors.textDark}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => handleOpenChat(item)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  const showEmpty = visibleConnections.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View className="header">
        <Text style={styles.title}>My Connections</Text>
        <Text style={styles.subtitleHeader}>
          Manage your mentorship relationships
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >{`${tab.label} (${counts[tab.key] || 0})`}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {showEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={styles.emptyTitle}>No connections yet</Text>
          <Text style={styles.emptySubtitle}>
            Start connecting with mentors or students!
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleConnections}
          keyExtractor={(item) => item.id}
          renderItem={renderConnection}
          contentContainerStyle={{ paddingVertical: 12 }}
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  subtitleHeader: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 18,
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB55",
    borderRadius: 999,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: Colors.bgWhite,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: Colors.textDark,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMentor: {
    backgroundColor: "#FEF3C7",
  },
  avatarStudent: {
    backgroundColor: "#ECFDF3",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryGold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleBadgeMentor: {
    backgroundColor: "#ECFDF3",
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  roleBadgeTextMentor: {
    color: Colors.primaryGreen,
  },
  directionText: {
    fontSize: 11,
    color: Colors.textGray,
    marginTop: 4,
  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },
  pendingPill: {
    backgroundColor: "#FEF3C7",
  },
  activePill: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#215335", // darker green, similar to your design
  },
  declineBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },
  actionText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  declineText: {
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: "500",
  },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryGreen,
  },
  messageText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
