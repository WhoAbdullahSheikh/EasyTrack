import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/FontAwesome";

const CompletedStopsScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState("standard");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const getDriverData = async () => {
      const session = await AsyncStorage.getItem("driverSession");
      if (session) {
        const { email } = JSON.parse(session);
        fetchVehicleNumber(email);
      } else {
        console.log("No session email found.");
        setLoading(false);
        setErrorMessage("Session expired. Please log in again.");
        setIsModalVisible(true);
      }
    };

    getDriverData();
  }, []);

  const fetchVehicleNumber = async (email) => {
    try {
      const driverDoc = await firestore()
        .collection("Drivers")
        .where("email", "==", email)
        .get();

      if (!driverDoc.empty) {
        const driverData = driverDoc.docs[0].data();
        const vehicleNumberFromDriver = driverData.vehicleNumber;
        setVehicleNumber(vehicleNumberFromDriver);
        fetchAssignedRoutes(vehicleNumberFromDriver);
      } else {
        console.log("Driver not found.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching vehicle number: ", error);
      setErrorMessage("Error fetching vehicle number.");
      setIsModalVisible(true);
      setLoading(false);
    }
  };

  const fetchAssignedRoutes = (vehicleNumber) => {
    firestore()
      .collection("Routes")
      .doc("details")
      .onSnapshot((routeDoc) => {
        if (routeDoc.exists) {
          const routeData = routeDoc.data();
          const fetchedRoutes = routeData?.stops || [];

          const assignedRoutes = fetchedRoutes.filter(
            (route) => route.vehicleNumber === vehicleNumber
          );

          setAssignedRoutes(assignedRoutes);
          setLoading(false);

          if (assignedRoutes.length > 0) {
            const firstRoute = assignedRoutes[0];
            setRegion({
              latitude: firstRoute.coordinate.latitude,
              longitude: firstRoute.coordinate.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        } else {
          console.log("No such document!");
          setLoading(false);
        }
      });
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showMapOptions && (
        <Animated.View style={[styles.optionsMenu, { opacity: animation }]}>
          {}
          <TouchableOpacity
            style={[styles.customButton, styles.standardButton]}
            onPress={() => changeMapType("standard")}
          >
            <Text style={styles.buttonText}>Standard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.hybridButton]}
            onPress={() => changeMapType("hybrid")}
          >
            <Text style={styles.buttonText}>Hybrid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.satelliteButton]}
            onPress={() => changeMapType("satellite")}
          >
            <Text style={styles.buttonText}>Satellite</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {}
      <View style={styles.routesContainer}>
        <Text style={styles.AvlBusesLabel}>Assigned Stops</Text>
        {assignedRoutes.length > 0 ? (
          assignedRoutes.map((route, index) => (
            <View key={index} style={styles.routeCard}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon
                    name="bus"
                    size={30}
                    color="#fa9837"
                    style={styles.busIcon}
                  />
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={styles.CardTitle}>
                    {route.title} - {route.vehicleNumber}
                  </Text>
                  <View style={styles.divider} />
                  <Text style={styles.routeText}>
                    Category: {route.category}
                  </Text>
                  <Text style={styles.routeText}>
                    Start: {route.startLocation}
                  </Text>
                  <Text style={styles.routeText}>
                    Destination: {route.destination}
                  </Text>
                  <Text style={styles.routeText}>
                    Cordinates: Latitude: {route.coordinate.latitude}, Longitude:
                    {route.coordinate.longitude}
                  </Text>
                  <Text style={styles.routeText}>
                    Time Slot: {route.timeSlot}
                  </Text>
                  <Text style={styles.routeText}>
                    Description: {route.description}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text>No routes assigned to your vehicle number</Text>
        )}
      </View>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require("../../../../assets/warn.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  toggleButton: {
    position: "absolute",
    top: 55,
    right: 12,
    zIndex: 10,
  },
  iconBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 8,
    borderRadius: 0,
  },
  optionsMenu: {
    position: "absolute",
    top: 110,
    right: 12,
    borderRadius: 8,
    padding: 1,
  },
  customButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  standardButton: {
    backgroundColor: "#4CAF50",
  },
  hybridButton: {
    backgroundColor: "#FF9800",
  },
  satelliteButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Raleway-Bold",
  },
  routesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  AvlBusesLabel: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Raleway-Bold",
  },
  routeCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "#fa9837",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 15,
  },
  busIcon: {
    padding: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 50,
  },
  detailsContainer: {
    flex: 1,
  },
  CardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#fa9837",
    marginVertical: 10,
  },
  routeText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 250,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    backgroundColor: "#fa9837",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  completedButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  completedButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CompletedStopsScreen;
