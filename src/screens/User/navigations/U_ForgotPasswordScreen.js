import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const U_ForgotPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (isUpdating) return;

    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      setLoading(true);
      const session = await AsyncStorage.getItem("userSession");
      if (!session) {
        Alert.alert("Error", "No session found.");
        setIsUpdating(false);
        return;
      }

      const { email } = JSON.parse(session);

      const userSnapshot = await firestore()
        .collection("Users")
        .where("email", "==", email)
        .get();

      if (userSnapshot.empty) {
        Alert.alert("Error", "User not found.");
        setIsUpdating(false);
        return;
      }

      const userDoc = userSnapshot.docs[0];

      await firestore()
        .collection("Users")
        .doc(userDoc.id)
        .update({
          password: newPassword,
        });

      Alert.alert("Success", "Your password has been updated.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert("Error", "An error occurred while updating the password.");
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a81f0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.showPasswordButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleChangePassword}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Change Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontFamily: "Raleway-Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "black",
    flex: 1,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showPasswordButton: {
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: "#1a81f0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway-Bold",
  },
});

export default U_ForgotPasswordScreen;
