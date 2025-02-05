import React, { useState } from "react";
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
import Icon from "react-native-vector-icons/FontAwesome"; 

const D_SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false); 

  const driversCollection = firestore().collection("Drivers"); 

  const handleSignUp = async () => {
    
    if (!name || !phoneNumber || !vehicleNumber || !cnicNumber) {
      showModal("Please fill all required fields");
    } else if (password !== confirmPassword) {
      showModal("Passwords do not match");
    } else if (phoneNumber.length !== 10) {
      showModal("Phone number must be 10 digits");
    } else if (cnicNumber.length !== 13) {
      
      showModal("CNIC number must be 13 digits");
    } else {
      setIsLoading(true);
      try {
        
        const newDriverRef = await driversCollection.add({
          name: name,
          email: email, 
          password: password,
          phoneNumber: "+92" + phoneNumber, 
          vehicleNumber: vehicleNumber,
          cnicNumber: cnicNumber, 
        });

        navigation.navigate("D_Login"); 
      } catch (error) {
        showModal(error.message); 
      } finally {
        setIsLoading(false); 
      }
    }
  };

  const handlePhoneChange = (text) => {
    if (text.length <= 10 && /^[0-9]*$/.test(text)) {
      setPhoneNumber(text); 
    }
  };

  const handleCnicChange = (text) => {
    if (text.length <= 13 && /^[0-9]*$/.test(text)) {
      setCnicNumber(text); 
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

        <Text style={styles.title}>Driver Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle Number"
          placeholderTextColor="#888"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number (without +92)"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="CNIC Number (13 digits)"
          placeholderTextColor="#888"
          value={cnicNumber}
          onChangeText={handleCnicChange}
          keyboardType="numeric"
          maxLength={13}
        />
        <TextInput
          style={styles.input}
          placeholder="Email (Optional)"
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

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput]} 
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() =>
              setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
            } 
          >
            <Icon
              name={isConfirmPasswordVisible ? "eye" : "eye-slash"} 
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("D_Login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountTypeButton}
          onPress={() => navigation.navigate("Options")}
        >
          <Text style={styles.accountTypeButtonText}>Change Account Type</Text>
        </TouchableOpacity>
      </ScrollView>

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
    marginBottom: 20,
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
    top: "35%",
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
  accountTypeButton: {
    backgroundColor: "#f25e65",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  accountTypeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
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

export default D_SignUpScreen;
