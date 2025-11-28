import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Colors } from "../styles/colors";

export default function ConnectionScreen() {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);

  const currentUser = auth.currentUser?.uid;

  // Fetch users excluding current user
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const list = snapshot.docs
        .filter((doc) => doc.id !== currentUser)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    };
    fetchUsers();
  }, []);

  // Fetch existing connections
  useEffect(() => {
    const fetchConnections = async () => {
      const q = query(
        collection(db, "connections"),
        where("requesterId", "==", currentUser)
      );
      const snapshot = await getDocs(q);
      setConnections(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchConnections();
  }, []);

  // Send connection request
  const handleConnect = async (receiverId) => {
    try {
      await addDoc(collection(db, "connections"), {
        requesterId: currentUser,
        receiverId,
        status: "pending",
        createdAt: new Date(),
      });
      Alert.alert("Request sent!", "Your connection request has been sent.");
    } catch (error) {
      console.log(error);
    }
  };

  // Accept request
  const handleAccept = async (connectionId) => {
    try {
      const ref = doc(db, "connections", connectionId);
      await updateDoc(ref, { status: "accepted" });
      Alert.alert("Connected!", "You are now connected!");
    } catch (error) {
      console.log(error);
    }
  };

  // Decline request
  const handleDecline = async (connectionId) => {
    try {
      const ref = doc(db, "connections", connectionId);
      await updateDoc(ref, { status: "declined" });
      Alert.alert("Request declined.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Connections</Text>

      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.userName}>{user.name}</Text>

          {connections.some(
            (c) => c.receiverId === user.id && c.status === "pending"
          ) ? (
            <TouchableOpacity style={styles.pendingButton}>
              <Ionicons name="time-outline" size={16} color="#FFF" />
              <Text style={styles.pendingText}>Pending</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnect(user.id)}
            >
              <Ionicons name="person-add-outline" size={16} color="#FFF" />
              <Text style={styles.connectText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: Colors.textDark,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: { fontSize: 16, color: Colors.textDark },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectText: { color: "#FFF", marginLeft: 4, fontWeight: "600" },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.textGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingText: { color: "#FFF", marginLeft: 4 },
});
