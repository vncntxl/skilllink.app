// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Colors } from "../styles/colors";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student"); // "student" | "mentor"
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Missing details", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCred.user;

      // Set displayName in Firebase Auth (nice for debugging)
      await updateProfile(user, {
        displayName: name,
      });

      // Create Firestore doc in "users" (id = uid)
      const initials = name.trim().charAt(0).toUpperCase();

      await setDoc(doc(db, "users", user.uid), {
        name,
        email: email.trim().toLowerCase(),
        role, // "student" / "mentor"
        avatar: initials,
        categories: [role], // you can expand later
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created. Logging you in.");
      navigation.replace("Main");
    } catch (error) {
      console.log("Register error:", error);
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/skilllink-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Brand heading */}
      <Text style={styles.brandName}>SkillLink</Text>
      <Text style={styles.brandTagline}>Connect. Learn. Grow.</Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>
          Join SkillLink to find mentors, build connections, and grow your
          skills.
        </Text>

        {/* Name */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={18}
            color={Colors.textGray}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Full name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textGray}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={Colors.textGray}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={Colors.textGray}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={Colors.textGray}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={Colors.textGray}
          />
        </View>

        {/* Confirm */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={Colors.textGray}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholderTextColor={Colors.textGray}
          />
        </View>

        {/* Role selector */}
        <Text style={styles.sectionLabel}>I’m joining SkillLink as a:</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[
              styles.roleChip,
              role === "student" && styles.roleChipActive,
            ]}
            onPress={() => setRole("student")}
          >
            <Ionicons
              name="book-outline"
              size={16}
              color={role === "student" ? "#FFFFFF" : Colors.textGray}
            />
            <Text
              style={[
                styles.roleChipText,
                role === "student" && styles.roleChipTextActive,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleChip,
              role === "mentor" && styles.roleChipActive,
            ]}
            onPress={() => setRole("mentor")}
          >
            <Ionicons
              name="ribbon-outline"
              size={16}
              color={role === "mentor" ? "#FFFFFF" : Colors.textGray}
            />
            <Text
              style={[
                styles.roleChipText,
                role === "mentor" && styles.roleChipTextActive,
              ]}
            >
              Mentor
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "CREATING..." : "REGISTER"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 8,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primaryGreen,
    textAlign: "center",
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: "center",
    marginBottom: 18,
  },
  card: {
    backgroundColor: Colors.bgWhite,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    padding: 10,
    height: 42,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: "#FFFFFF",
  },
  roleChipActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  roleChipText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.textGray,
  },
  roleChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  buttonWrapper: {
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  linkText: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.textGray,
  },
  linkHighlight: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
