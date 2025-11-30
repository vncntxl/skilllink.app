import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Colors } from "../styles/colors";

export default function ChatScreen({ route, navigation }) {
  const { otherUserId, otherUserName } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // deterministic conversation ID for both users
  const conversationId = useMemo(() => {
    const ids = [currentUser.uid, otherUserId].sort();
    return `${ids[0]}_${ids[1]}`;
  }, [currentUser.uid, otherUserId]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: otherUserName,
    });

    const msgsRef = collection(db, "conversations", conversationId, "messages");

    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(list);
    });

    return () => unsub();
  }, [conversationId, navigation, otherUserName]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const msgsRef = collection(
        db,
        "conversations",
        conversationId,
        "messages"
      );

      await addDoc(msgsRef, {
        text: trimmed,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setText("");
    } catch (err) {
      console.log("send message error:", err);
    }
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === currentUser.uid;

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowTheirs,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={`Message ${otherUserName}`}
          placeholderTextColor={Colors.textGray}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: Colors.primaryGreen,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: {
    color: "#fff",
    fontSize: 14,
  },
  bubbleTextTheirs: {
    color: Colors.textDark,
    fontSize: 14,
  },
  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryGreen,
  },
});
