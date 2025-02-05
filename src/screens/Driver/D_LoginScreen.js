import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const D_LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const usersCollection = firestore().collection("Drivers");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("driverSession");

        if (session) {
          const { email } = JSON.parse(session);

          const driverSnapshot = await usersCollection
            .where("email", "==", email)
            .get();

          if (!driverSnapshot.empty) {
            navigation.replace("DriverMainApp");
          } else {
            await AsyncStorage.removeItem("driverSession");
          }
        }
      } catch (error) {
        console.error("Error validating session:", error);
        await AsyncStorage.removeItem("driverSession");
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showModal("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const userSnapshot = await usersCollection
        .where("email", "==", email)
        .get();

      if (userSnapshot.empty) {
        showModal("No user found with this email");
        return;
      }

      const user = userSnapshot.docs[0].data();

      if (user.password === password) {
        await AsyncStorage.setItem("driverSession", JSON.stringify({ email }));
        navigation.replace("DriverMainApp"); // Use replace to avoid stack issues
      } else {
        showModal("Incorrect password");
      }
    } catch (error) {
      showModal("An error occurred. Please try again");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = (message) => {
    setErrorMessage(message);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.topSheet}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Driver Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? "eye" : "eye-slash"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("D_SignUp")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for displaying error message */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#fa9837"
                style={styles.loading}
              />
            ) : (
              <>
                <Image
                  source={require("../../../assets/warn.png")}
                  style={styles.image}
                  resizeMode="contain"
                />
                <Text style={styles.modalText}>{errorMessage}</Text>
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  topSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fa9837",
    zIndex: 1,
    paddingTop: 20,
  },
  logo: {
    width: 250,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    marginTop: 150,
    marginBottom: 40,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  button: {
    backgroundColor: "#fa9837",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
  },
  link: {
    color: "#fa9837",
    marginTop: 20,
    fontSize: 14,
    fontFamily: "Raleway-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    marginBottom: 20,
  },
  loading: {
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#f25e65",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "Raleway-Regular",
    fontSize: 16,
  },
});

export default D_LoginScreen;
