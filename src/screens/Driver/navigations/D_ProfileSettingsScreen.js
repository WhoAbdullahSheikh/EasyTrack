import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "react-native-image-picker";
import { Platform } from "react-native";
import RNFS from "react-native-fs"; 

const D_ProfileSettingsScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",

    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [newProfileImage, setNewProfileImage] = useState(null); 
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const session = await AsyncStorage.getItem("driverSession");
      if (session) {
        const { email } = JSON.parse(session);

        
        const userSnapshot = await firestore()
          .collection("Drivers") 
          .where("email", "==", email) 
          .get();

        if (!userSnapshot.empty) {
          const user = userSnapshot.docs[0].data(); 
          setUserData({
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
          });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  
  const pickImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        setNewProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (isUpdating) return; 

    setIsUpdating(true);

    try {
      let updatedProfileImage = userData.profileImage || ""; 

      
      if (newProfileImage) {
        
        const fileExists = await RNFS.exists(newProfileImage);

        if (!fileExists) {
          throw new Error("The selected image file does not exist.");
        }

        
        const fileName = `${new Date().getTime()}.jpg`;
        await reference.putFile(newProfileImage);
        updatedProfileImage = await reference.getDownloadURL(); 
      }

      
      const updatedUserData = {
        name: userData.name || "", 
        email: userData.email || "", 
        profileImage: updatedProfileImage || "", 
      };

      
      const session = await AsyncStorage.getItem("driverSession");
      const { email } = JSON.parse(session);

      const userSnapshot = await firestore()
        .collection("Drivers")
        .where("email", "==", email)
        .get();

      if (userSnapshot.empty) {
        Alert.alert("Error", "User not found");
        return;
      }

      const userDoc = userSnapshot.docs[0]; 

      
      await firestore()
        .collection("Drivers")
        .doc(userDoc.id) 
        .update({
          name: updatedUserData.name,
          profileImage: updatedUserData.profileImage,
        });

      
      await AsyncStorage.setItem(
        "driverSession",
        JSON.stringify({
          email: updatedUserData.email,
          name: updatedUserData.name,
          profileImage: updatedUserData.profileImage, 
        })
      );

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        `There was an issue updating your profile: ${error.message}`
      );
    } finally {
      setIsUpdating(false);
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
      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={{
            uri:
              newProfileImage ||
              userData.profileImage ||
              "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Ionicons
          name="camera"
          size={30}
          color="#fff"
          style={styles.cameraIcon}
        />
      </TouchableOpacity>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={userData.email}
          editable={false} 
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Update Profile</Text>
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
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginBottom: 20,
    alignSelf: "center",
    backgroundColor: "#ddd",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
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
  },
  updateButton: {
    backgroundColor: "#fa9837",
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

export default D_ProfileSettingsScreen;
