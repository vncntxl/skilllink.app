// screens/ConnectionsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function ConnectionsScreen() {
  const [loading, setLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const uid = currentUser.uid;

      const connectionsRef = collection(db, "connections");

      // Firestore has no OR, so we query both sides
      const [snapAsReceiver, snapAsRequester] = await Promise.all([
        getDocs(query(connectionsRef, where("receiverId", "==", uid))),
        getDocs(query(connectionsRef, where("requesterId", "==", uid))),
      ]);

      const raw = [...snapAsReceiver.docs, ...snapAsRequester.docs].map(
        (d) => ({
          id: d.id,
          ...d.data(),
        })
      );

      // Helper: group by current user's perspective
      const incoming = raw.filter(
        (c) => c.receiverId === uid && c.status === "pending"
      );
      const sent = raw.filter(
        (c) => c.requesterId === uid && c.status === "pending"
      );
      const accepted = raw.filter((c) => c.status === "accepted");

      // Now we need to attach "other user" details (name, role)
      const uniqueUserIds = new Set();
      raw.forEach((c) => {
        if (c.requesterId !== uid) uniqueUserIds.add(c.requesterId);
        if (c.receiverId !== uid) uniqueUserIds.add(c.receiverId);
      });

      const usersById = {};
      if (uniqueUserIds.size > 0) {
        const usersRef = collection(db, "users");
        const allUsersSnap = await getDocs(usersRef);
        allUsersSnap.forEach((u) => {
          if (uniqueUserIds.has(u.id)) {
            usersById[u.id] = { id: u.id, ...u.data() };
          }
        });
      }

      // decorate each connection with "otherUser"
      const decorate = (arr) =>
        arr.map((c) => {
          const otherId = c.requesterId === uid ? c.receiverId : c.requesterId;
          return {
            ...c,
            otherUser: usersById[otherId] || {
              id: otherId,
              name: "SkillLink user",
            },
          };
        });

      setIncomingRequests(decorate(incoming));
      setSentRequests(decorate(sent));
      setConnections(decorate(accepted));
    } catch (err) {
      console.log("Load connections error:", err);
      Alert.alert("Error", "Could not load connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      const ref = doc(db, "connections", connectionId);
      await updateDoc(ref, { status: "accepted" });
      Alert.alert("Connected", "You are now connected!");
      loadConnections();
    } catch (err) {
      console.log("Accept error:", err);
      Alert.alert("Error", "Could not accept the request.");
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      const ref = doc(db, "connections", connectionId);
      await updateDoc(ref, { status: "declined" });
      Alert.alert("Request declined");
      loadConnections();
    } catch (err) {
      console.log("Decline error:", err);
      Alert.alert("Error", "Could not decline the request.");
    }
  };

  const handleOpenChat = (otherUser) => {
    // TODO: later navigate to Chat screen
    Alert.alert(
      "Chat coming soon",
      `This would open a chat with ${otherUser.name || "your connection"}.`
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.infoText}>
          Please log in again to view your connections.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View style={styles.headerBlock}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="people-outline"
            size={22}
            color={Colors.primaryGreen}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Connections</Text>
          <Text style={styles.headerSubtitle}>
            Manage requests and stay in touch with your mentors and peers.
          </Text>
        </View>
      </View>

      {/* Pending requests (incoming) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending requests</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{incomingRequests.length}</Text>
          </View>
        </View>

        {incomingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No new connection requests.</Text>
        ) : (
          incomingRequests.map((req) => (
            <View key={req.id} style={styles.requestRow}>
              <View style={styles.userAvatarCircle}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.primaryGreen}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {req.otherUser.name || "SkillLink user"}
                </Text>
                {req.otherUser.role ? (
                  <Text style={styles.userRole}>{req.otherUser.role}</Text>
                ) : null}
              </View>
              <View style={styles.requestButtonsRow}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(req.id)}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(req.id)}
                >
                  <Ionicons name="close" size={16} color={Colors.textGray} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Accepted connections */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your connections</Text>
          <View
            style={[styles.badgePill, { backgroundColor: Colors.softGreenBg }]}
          >
            <Text style={[styles.badgeText, { color: Colors.primaryGreen }]}>
              {connections.length}
            </Text>
          </View>
        </View>

        {connections.length === 0 ? (
          <Text style={styles.emptyText}>
            You have no active connections yet. Start by browsing profiles and
            sending a connection request.
          </Text>
        ) : (
          connections.map((conn) => (
            <View key={conn.id} style={styles.connectionRow}>
              <View style={styles.userAvatarCircle}>
                <Ionicons
                  name="person-circle-outline"
                  size={26}
                  color={Colors.primaryGreen}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {conn.otherUser.name || "SkillLink user"}
                </Text>
                {conn.otherUser.role ? (
                  <Text style={styles.userRole}>
                    {conn.otherUser.role} · Connected
                  </Text>
                ) : (
                  <Text style={styles.userRole}>Connected</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => handleOpenChat(conn.otherUser)}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Sent requests */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Requests you sent</Text>
        </View>

        {sentRequests.length === 0 ? (
          <Text style={styles.emptyText}>
            You haven’t sent any connection requests yet.
          </Text>
        ) : (
          sentRequests.map((req) => (
            <View key={req.id} style={styles.requestRow}>
              <View style={styles.userAvatarCircle}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.primaryGold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {req.otherUser.name || "SkillLink user"}
                </Text>
                {req.otherUser.role ? (
                  <Text style={styles.userRole}>{req.otherUser.role}</Text>
                ) : null}
              </View>
              <View style={styles.pendingPill}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.textGray}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: "center",
  },
  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softGreenBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.softYellowBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textGray,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  userAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softGreenBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
  },
  userRole: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  requestButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  acceptBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  declineBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chatBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pendingText: {
    fontSize: 12,
    color: Colors.textGray,
    fontWeight: "500",
  },
});
