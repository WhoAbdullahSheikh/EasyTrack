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

const D_AccountScreen = () => {
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchDriverData = async () => {
    try {
      const session = await AsyncStorage.getItem("driverSession");
      if (session) {
        const { email } = JSON.parse(session);
        const driverSnapshot = await firestore()
          .collection("Drivers")
          .where("email", "==", email)
          .get();

        if (!driverSnapshot.empty) {
          const driver = driverSnapshot.docs[0].data();
          setDriverData(driver);
        } else {
          setError("Driver data not found.");
          navigation.navigate("D_Login");
        }
      } else {
        setError("Session expired. Please log in again.");
        navigation.navigate("D_Login");
      }
    } catch (error) {
      setError("Failed to load driver data.");
      navigation.navigate("D_Login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("driverSession");
    navigation.navigate("Options");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDriverData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fa9837" />
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
              driverData?.profileImage ||
              "https://jonmgomes.com/wp-content/uploads/2022/03/Person-Icon-600x600-1-300x300.png",
          }}
          style={styles.profileImage}
        />
      </View>

      <Text style={styles.name}>{driverData?.name || "Driver Name"}</Text>
      <Text style={styles.email}>{driverData?.email || "Email"}</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Driver Details</Text>

        {/* Divider Line Below the Title */}
        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>{driverData?.name || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>{driverData?.email || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>
                {driverData?.phoneNumber || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>CNIC</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.detailValue}>{driverData?.cnicNumber || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Settings */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("DProfileSettings")}
      >
        <Ionicons
          name="person-circle-outline"
          size={25}
          color="#fa9837"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Profile Settings</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color="#fa9837"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {/* Privacy & Security */}
      <TouchableOpacity style={styles.securityButton}
         onPress={() => navigation.navigate("ForgotPassword")
      }>
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
          color="#fa9837"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensures ScrollView takes all available height
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
    color: "#fa9837",
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
    color: "#fa9837",
  },
  divider: {
    height: 0.8,
    backgroundColor: "#fa9837",
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
    backgroundColor: "#fff0e0",
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
    marginRight: 0,
  },
  logoutButton: {
    width: "95%",
    padding: 15,
    backgroundColor: "#ff5454",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});

export default D_AccountScreen;
