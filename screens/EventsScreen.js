// screens/EventsScreen.js
import React, { useEffect, useState } from "react";
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
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function EventsScreen() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("student"); // "student" | "mentor"
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "mine" | "past"
  const [showForm, setShowForm] = useState(false);

  // form fields (mentor only)
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(""); // simple string: "23/11/2025"
  const [eventTime, setEventTime] = useState(""); // "10:30"
  const [category, setCategory] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");

  // ----------------------------------------------------
  // Fetch user profile + events
  // ----------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // user profile
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || "");
          setUserRole(data.role || "student");
        }

        await fetchEvents();
      } catch (err) {
        console.log("Events init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setEvents(list);
    } catch (err) {
      console.log("Fetch events error:", err);
    }
  };

  // ----------------------------------------------------
  // Mentor: create event
  // ----------------------------------------------------
  const resetForm = () => {
    setTitle("");
    setEventDate("");
    setEventTime("");
    setCategory("");
    setMeetingLink("");
    setCapacity("");
    setDescription("");
  };

  const handleSaveEvent = async () => {
    if (!title || !eventDate || !eventTime || !capacity) {
      Alert.alert(
        "Missing details",
        "Please add a title, date, time and capacity."
      );
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    const capacityNumber = parseInt(capacity, 10);
    if (Number.isNaN(capacityNumber) || capacityNumber <= 0) {
      Alert.alert("Capacity", "Capacity must be a positive number.");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title,
        date: eventDate,
        time: eventTime,
        category,
        meetingLink,
        capacity: capacityNumber,
        description,
        createdById: uid,
        createdByName: userName,
        attendees: [],
        createdAt: new Date(),
      });

      Alert.alert("Success", "Event created.");
      resetForm();
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.log("Save event error:", err);
      Alert.alert("Error", "Could not create the event.");
    }
  };

  // ----------------------------------------------------
  // Student: join event
  // ----------------------------------------------------
  const handleJoinEvent = async (event) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    const alreadyJoined =
      Array.isArray(event.attendees) &&
      event.attendees.some((a) => a && a.userId === uid);

    if (alreadyJoined) {
      Alert.alert("Already joined", "You have already joined this event.");
      return;
    }

    const attendeeCount = Array.isArray(event.attendees)
      ? event.attendees.filter(Boolean).length
      : 0;

    if (event.capacity && attendeeCount >= event.capacity) {
      Alert.alert("Event full", "This event has reached its capacity.");
      return;
    }

    try {
      const ref = doc(db, "events", event.id);
      await updateDoc(ref, {
        attendees: arrayUnion({
          userId: uid,
          name: userName || "Student",
        }),
      });

      Alert.alert(
        "Joined event",
        `You joined “${event.title}”.`,
        [
          { text: "OK" },
          {
            text: "Add reminder",
            onPress: () =>
              Alert.alert(
                "Reminder",
                "Add this event to your calendar or notes so you don’t forget."
              ),
          },
        ],
        { cancelable: true }
      );

      fetchEvents();
    } catch (err) {
      console.log("Join event error:", err);
      Alert.alert("Error", "Could not join this event.");
    }
  };

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  const filterEventsForTab = () => {
    const uid = auth.currentUser?.uid;
    const now = new Date();

    return events.filter((ev) => {
      // treat date as string; if it looks like dd/mm/yyyy convert, otherwise just show
      let evDate = null;
      if (typeof ev.date === "string") {
        // try parse "dd/mm/yyyy"
        const parts = ev.date.split("/");
        if (parts.length === 3) {
          const [d, m, y] = parts.map(Number);
          evDate = new Date(y, m - 1, d);
        }
      }

      if (activeTab === "mine") {
        if (!uid) return false;

        const createdByMe = ev.createdById === uid;
        const joinedByMe =
          Array.isArray(ev.attendees) &&
          ev.attendees.some((a) => a && a.userId === uid);
        return createdByMe || joinedByMe;
      }

      if (activeTab === "past") {
        if (!evDate) return false;
        return evDate < now;
      }

      // upcoming
      if (!evDate) return true;
      return evDate >= now;
    });
  };

  // ----------------------------------------------------
  // UI pieces
  // ----------------------------------------------------
  const renderTabButton = (id, label) => (
    <TouchableOpacity
      key={id}
      style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
      onPress={() => setActiveTab(id)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === id && styles.tabButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEventCard = (event) => {
    const uid = auth.currentUser?.uid;

    const attendeeCount = Array.isArray(event.attendees)
      ? event.attendees.filter(Boolean).length
      : 0;

    const alreadyJoined =
      Array.isArray(event.attendees) &&
      event.attendees.some((a) => a && a.userId === uid);

    const isHost = event.createdById === uid;
    const isFull = event.capacity && attendeeCount >= event.capacity;

    return (
      <View key={event.id} style={styles.card}>
        <Text style={styles.cardTitle}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={Colors.textGray}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.metaText}>
            {event.date} · {event.time}
          </Text>
        </View>

        {event.category ? (
          <View style={styles.metaRow}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={Colors.textGray}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.metaText}>{event.category}</Text>
          </View>
        ) : null}

        {event.description ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{event.description}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooterRow}>
          <View style={styles.capacityRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={Colors.textGray}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.metaText}>
              {attendeeCount}/{event.capacity || 0}
            </Text>
          </View>

          {isHost ? (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>You’re hosting</Text>
            </View>
          ) : userRole === "student" ? (
            <TouchableOpacity
              style={[
                styles.joinButton,
                (alreadyJoined || isFull) && styles.joinButtonDisabled,
              ]}
              onPress={() => handleJoinEvent(event)}
              disabled={alreadyJoined || isFull}
            >
              <Text style={styles.joinButtonText}>
                {alreadyJoined ? "Joined" : isFull ? "Full" : "Join"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const renderListView = () => {
    const list = filterEventsForTab();

    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.metaText}>Loading events...</Text>
        </View>
      );
    }

    if (list.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={Colors.primaryGreen}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for upcoming mentoring events.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {list.map(renderEventCard)}
      </ScrollView>
    );
  };

  const renderFormView = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Create Mentoring Event</Text>
          <Text style={styles.subtitle}>
            Share a session with students. Include date, time and a meeting
            link.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelChip}
          onPress={() => {
            resetForm();
            setShowForm(false);
          }}
        >
          <Text style={styles.cancelChipText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. UI Design Masterclass"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Date (DD/MM/YYYY)</Text>
        <TextInput
          style={styles.input}
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="e.g. 23/11/2025"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={eventTime}
          onChangeText={setEventTime}
          placeholder="e.g. 10:30"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. Design, Career, Tech"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Meeting link</Text>
        <TextInput
          style={styles.input}
          value={meetingLink}
          onChangeText={setMeetingLink}
          placeholder="e.g. Zoom / Teams / Google Meet link"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Capacity</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
          placeholder="e.g. 20"
          placeholderTextColor={Colors.textGray}
        />

        <Text style={styles.formLabel}>Short description</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholder="What will students learn in this session?"
          placeholderTextColor={Colors.textGray}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
          <Text style={styles.saveButtonText}>Save Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ----------------------------------------------------
  // Main render
  // ----------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Top heading + mentor action button */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mentoring Events</Text>
          <Text style={styles.subtitle}>
            Join workshops, Q&As and networking sessions.
          </Text>
        </View>

        {userRole === "mentor" && !showForm && (
          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add-outline" size={20} color="#FFF" />
            <Text style={styles.newEntryText}>New Event</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {renderTabButton("upcoming", "Upcoming")}
        {renderTabButton("mine", "My Events")}
        {renderTabButton("past", "Past")}
      </View>

      {showForm && userRole === "mentor" ? renderFormView() : renderListView()}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabButtonText: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: Colors.textDark,
    fontWeight: "600",
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
  // cards
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
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
  notesBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 18,
  },
  cardFooterRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  joinButton: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  joinButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  hostBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textDark,
  },
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
    color: Colors.textDark,
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
  inputMultiline: {
    minHeight: 100,
    marginTop: 4,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  // empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
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
    paddingHorizontal: 24,
  },
});
