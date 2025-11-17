// screens/FeedbackScreen.js
import React, { useState } from "react";
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

const INITIAL_ENTRY = {
  id: "1",
  mentorName: "David Tan",
  rating: 5,
  date: "Jan 15, 2025",
  topics: ["Portfolio Review", "UX Process", "Design Thinking"],
  notes:
    "Great first session with Mia! She has strong design fundamentals and is eager to learn. We focused on portfolio presentation and discussed how to better articulate her design decisions.",
};

export default function FeedbackScreen() {
  const [entries, setEntries] = useState([INITIAL_ENTRY]);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [sessionDate, setSessionDate] = useState("");
  const [topicsText, setTopicsText] = useState("");
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(0);

  const resetForm = () => {
    setSessionDate("");
    setTopicsText("");
    setReflection("");
    setRating(0);
  };

  const handleNewEntryPress = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleSave = () => {
    if (!sessionDate || !reflection || rating === 0) {
      Alert.alert(
        "Missing details",
        "Please add a date, reflection and rating before saving."
      );
      return;
    }

    const topicsArray = topicsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newEntry = {
      id: Date.now().toString(),
      mentorName: "Reflection Entry", // you can change this later
      date: sessionDate,
      topics: topicsArray,
      notes: reflection,
      rating,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setShowForm(false);
    resetForm();
    Alert.alert("Saved", "Reflection saved & +20 points earned!");
  };

  const renderListView = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Title + New Entry button */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Feedback &{"\n"}Reflections</Text>
          <Text style={styles.subtitle}>
            Document your mentorship journey and earn points!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={handleNewEntryPress}
        >
          <Ionicons
            name="add-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.newEntryText}>New Entry</Text>
        </TouchableOpacity>
      </View>

      {entries.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mentorName}>{entry.mentorName}</Text>
            </View>
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

          {entry.topics && entry.topics.length > 0 && (
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

  const renderFormView = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Feedback & Reflections</Text>
          <Text style={styles.subtitle}>
            Document your mentorship journey and earn points!
          </Text>
        </View>
        <TouchableOpacity style={styles.cancelChip} onPress={handleCancel}>
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
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Topics Covered (comma-separated)</Text>
        <TextInput
          placeholder="e.g. UI Design, Figma Prototyping, User Research"
          style={styles.input}
          value={topicsText}
          onChangeText={setTopicsText}
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          multiline
          textAlignVertical="top"
          placeholder="What did you learn? What insights did you gain?"
          value={reflection}
          onChangeText={setReflection}
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Session Rating</Text>
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
          <Text style={styles.saveButtonText}>
            Save Reflection & Earn Points
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newEntryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
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
    fontWeight: "500",
  },
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textGray,
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  topicPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  topicText: {
    fontSize: 11,
    color: Colors.textDark,
  },
  notesBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  notesText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  // form
  formCard: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#F9FAFB",
  },
  inputMultiline: {
    minHeight: 120,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
