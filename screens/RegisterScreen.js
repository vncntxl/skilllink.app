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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Colors } from "../styles/colors";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Missing details", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Account created. Logging you in.");
      navigation.replace("Main"); // straight into the app
    } catch (error) {
      console.log("Register error:", error);
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/skilllink-logo.png")}
        style={styles.logo}
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
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={Colors.textGray}
          />
        </View>

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

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegister}
          >
            <Text style={styles.primaryButtonText}>REGISTER</Text>
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
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
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
