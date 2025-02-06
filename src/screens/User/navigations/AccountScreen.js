import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const AccountScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session) {
        const { email } = JSON.parse(session);
        const userSnapshot = await firestore()
          .collection("Users")
          .where("email", "==", email)
          .get();

        if (!userSnapshot.empty) {
          const user = userSnapshot.docs[0].data();
          setUserData(user);
        } else {
          setError("User data not found.");
          navigation.navigate("U_Login");
        }
      } else {
        setError("Session expired. Please log in again.");
        navigation.navigate("U_Login");
      }
    } catch (error) {
      setError("Failed to load user data.");
      navigation.navigate("U_Login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userSession");
    await AsyncStorage.removeItem("driverSession");
    navigation.navigate("Options");
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a81f0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              userData?.profileImage ||
              "https://jonmgomes.com/wp-content/uploads/2022/03/Person-Icon-600x600-1-300x300.png",
          }}
          style={styles.profileImage}
        />
      </View>

      <Text style={styles.name}>{userData?.name || "Name"}</Text>
      <Text style={styles.email}>{userData?.email || "Email"}</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Account Details</Text>

        {}
        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>{userData?.name || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>{userData?.email || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>
                {userData?.phoneNumber || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>
                {userData?.address || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ProfileSettings")}
      >
        <Ionicons
          name="person-circle-outline"
          size={25}
          color="#549ff0"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Profile Settings</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color="#1a81f0"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {}
      <TouchableOpacity style={styles.securityButton}
        onPress={() => navigation.navigate("UForgotPassword")}
        >
        <Ionicons
          name="shield-checkmark-outline"
          size={25}
          color="#ff5454"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Privacy & Security</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color="#1a81f0"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 80,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a81f0",
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  cardContainer: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    marginBottom: 10,
    color: "#1a81f0",
  },
  divider: {
    height: 0.8,
    backgroundColor: "#1a81f0",
    marginVertical: 5,
  },
  detailsContainer: {
    paddingVertical: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Raleway-Bold",
    color: "black",
  },
  fieldValue: {
    backgroundColor: "#edf2f7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: "80%",
  },
  detailValue: {
    fontSize: 12,
    color: "black",
    textAlign: "left",
  },
  button: {
    width: "95%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  securityButton: {
    width: "95%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    marginLeft: 10,
    textAlign: "left",
    flex: 1,
  },
  icon: {
    marginLeft: 0,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  logoutButton: {
    width: "95%",
    padding: 15,
    backgroundColor: "#ff4d4d",
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    flex: 1,
  },
});

export default AccountScreen;
