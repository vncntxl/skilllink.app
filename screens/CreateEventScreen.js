import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../styles/colors";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function FeedbackScreen({ navigation }) {
  const [entries, setEntries] = useState([]); // FIXED
  const [showForm, setShowForm] = useState(false);

  // form fields
  const [sessionDate, setSessionDate] = useState("");
  const [topicsText, setTopicsText] = useState("");
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(0);

  //-------------------------------------------------
  // FETCH FEEDBACK FROM FIRESTORE ON LOAD
  //-------------------------------------------------
  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const q = query(
        collection(db, "feedback"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(list.reverse()); // newest first
    } catch (error) {
      console.log("Fetch Feedback Error:", error);
    }
  };

  //-------------------------------------------------
  // SAVE FEEDBACK TO FIRESTORE
  //-------------------------------------------------
  const handleSave = async () => {
    if (!sessionDate || !reflection || rating === 0) {
      Alert.alert(
        "Missing details",
        "Please add a date, reflection and rating."
      );
      return;
    }

    const topicsArray = topicsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: auth.currentUser.uid,
        date: sessionDate,
        topics: topicsArray,
        notes: reflection,
        rating,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Reflection saved!");
      resetForm();
      setShowForm(false);
      fetchFeedback(); // reload list
    } catch (error) {
      console.log("Save Feedback Error:", error);
    }
  };

  //-------------------------------------------------
  // RESET FORM
  //-------------------------------------------------
  const resetForm = () => {
    setSessionDate("");
    setTopicsText("");
    setReflection("");
    setRating(0);
  };

  //-------------------------------------------------
  // LIST VIEW
  //-------------------------------------------------
  const renderListView = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Feedback &{"\n"}Reflections</Text>
          <Text style={styles.subtitle}>
            Document your mentorship journey and earn points!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-outline" size={20} color="#FFF" />
          <Text style={styles.newEntryText}>New Entry</Text>
        </TouchableOpacity>
      </View>

      {entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.mentorName}>Reflection Entry</Text>

            <View style={styles.ratingWrapper}>
              <Ionicons
                name="star"
                size={16}
                color={Colors.primaryGold}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.ratingText}>{entry.rating}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.textGray}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.metaText}>{entry.date}</Text>
          </View>

          {entry.topics?.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.metaRow}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color={Colors.textGray}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.metaText}>Topics Covered</Text>
              </View>

              <View style={styles.topicRow}>
                {entry.topics.map((topic) => (
                  <View key={topic} style={styles.topicPill}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  //-------------------------------------------------
  // FORM VIEW
  //-------------------------------------------------
  const renderFormView = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Feedback & Reflections</Text>
          <Text style={styles.subtitle}>
            Document your mentorship journey and earn points!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelChip}
          onPress={() => setShowForm(false)}
        >
          <Text style={styles.cancelChipText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>Session Date</Text>
        <TextInput
          placeholder="e.g. 01/11/2025"
          style={styles.input}
          value={sessionDate}
          onChangeText={setSessionDate}
        />

        <Text style={styles.formLabel}>Topics (comma-separated)</Text>
        <TextInput
          placeholder="e.g. UI, Research"
          style={styles.input}
          value={topicsText}
          onChangeText={setTopicsText}
        />

        <Text style={styles.formLabel}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          multiline
          textAlignVertical="top"
          placeholder="What did you learn?"
          value={reflection}
          onChangeText={setReflection}
        />

        <Text style={styles.formLabel}>Rating</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={28}
                color={Colors.primaryGold}
                style={{ marginHorizontal: 4 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Reflection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {showForm ? renderFormView() : renderListView()}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 6,
  },
  newEntryButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  newEntryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  cancelChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelChipText: {
    fontSize: 12,
    color: Colors.textGray,
  },
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  ratingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ratingText: {
    color: "#92400E",
    fontWeight: "700",
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  topicRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  topicPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  topicText: { fontSize: 11, color: Colors.textDark },
  notesBox: {
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  notesText: { color: "#78350F", fontSize: 13, lineHeight: 18 },

  // form
  formCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    elevation: 2,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  inputMultiline: { minHeight: 120, marginTop: 4 },
  ratingRow: { flexDirection: "row", marginVertical: 8 },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: { color: "#FFF", fontWeight: "700" },
});
