import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Colors } from "../styles/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    // clear previous error
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Main"); // go to tabs
    } catch (error) {
      console.log("Login error:", error);

      // Map Firebase error codes to friendly messages
      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/invalid-email") {
        message = "That email address is not valid.";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Too many failed attempts. Please wait a moment and try again.";
      }

      setErrorMsg(message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/skilllink-logo.png")}
        style={styles.logo}
      />

      {/* Branding text */}
      <Text style={styles.brandName}>SkillLink</Text>
      <Text style={styles.brandTagline}>Connect. Learn. Grow.</Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Log in to continue your learning journey.
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

        {/* Error message */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.errorBoxText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>LOG IN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          {" "}
          <Text style={styles.linkText}>
            New to SkillLink?{" "}
            <Text style={styles.linkHighlight}>Create an account</Text>
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
    marginBottom: 20,
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

  input: {
    flex: 1,
    padding: 10,
    height: 42,
    fontSize: 14,
  },

  primaryButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },

  primaryButtonText: {
    color: "white",
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

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2", // red-100
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626", // red-600
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  errorBoxText: {
    color: "#B91C1C", // red-700
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
});
