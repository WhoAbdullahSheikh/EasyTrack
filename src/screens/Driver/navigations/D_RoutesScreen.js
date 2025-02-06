import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Animated,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import Icon2 from "react-native-vector-icons/FontAwesome";
import Icon3 from "react-native-vector-icons/Ionicons";

const D_RoutesScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState("standard");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [showTraffic, setShowTraffic] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    getDriverData();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      getUserLocation();
    }
  }, [locationPermission]);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
  
      if (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        setLocationPermission(true);
      } else {
        console.log("Location permission denied");
        setLocationPermission(false);
        setErrorMessage("Location permission is required for this app.");
        setIsModalVisible(true);
      }
    } else {
      setLocationPermission(true); 
    }
  };  
  const getUserLocation = () => {
    if (!locationPermission) {
      
      setErrorMessage("Location permission is required to get current location.");
      setIsModalVisible(true);
      setLoading(false);
      return;
    }
  
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        
        if (latitude && longitude) {
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
        } else {
          
          console.log("Invalid location data received.");
          setErrorMessage("Unable to get a valid location.");
          setIsModalVisible(true);
          setLoading(false);
        }
      },
      (error) => {
        
        console.log("Location error:", error);
  
        
        setErrorMessage("Unable to fetch location. Please check your permissions or try again.");
        setIsModalVisible(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 } 
    );
  };
  

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

  const fetchVehicleNumber = async (email) => {
    try {
      const driverDoc = await firestore()
        .collection("Drivers")
        .where("email", "==", email)
        .get();

      if (!driverDoc.empty) {
        const driverData = driverDoc.docs[0].data();
        setVehicleNumber(driverData.vehicleNumber);
        fetchAssignedRoutes(driverData.vehicleNumber);
      } else {
        console.log("Driver not found.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching vehicle number:", error);
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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.mapContainer, { height: isFullscreen ? "60%" : "40%" }]}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            showsUserLocation={true}
            followsUserLocation={true}
            mapType={mapType}
            showsTraffic={showTraffic}
          >
            {assignedRoutes.map((route, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: route.coordinate.latitude,
                  longitude: route.coordinate.longitude,
                }}
                title={route.title}
                description={route.description}
              />
            ))}
          </MapView>
        )}

        <TouchableOpacity
          style={styles.toggleButton} 
          onPress={toggleFullscreen}
        >
          <View style={styles.iconBackground}>
            <Icon
              name={isFullscreen ? "compress" : "expand"}
              size={20}
              color="#616161"
            />
          </View>
        </TouchableOpacity>
        
      </View>

      <View style={styles.routesContainer}>
    <Text style={styles.AvlBusesLabel}>Assigned Stops</Text>
  </View>

  {}
  <ScrollView contentContainerStyle={styles.routesContent}>
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
                Time Slot: {route.timeSlot}
              </Text>
              <Text style={styles.routeText}>
                Description: {route.description}
              </Text>

              {}
              <TouchableOpacity
                style={styles.completedButton}
                onPress={() =>
                  navigation.navigate("CompStops", {
                    routeId: route.id,
                  })
                }
              >
                <Text style={styles.completedButtonText}>
                  View Stops
                </Text>
                {}
                <Icon3
                  name="chevron-forward"
                  size={20}
                  color="#fff"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    ) : (
      <Text>No routes assigned to your vehicle number</Text>
    )}
  </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  mapContainer: {
    position: "relative",
    width: "100%",
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
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    padding: 10,
    borderRadius: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Raleway-Bold",
  },
  routesContainer: {
    padding: 15,
    backgroundColor: "#fa9837",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  AvlBusesLabel: {
    fontSize: 20,
    color: "white",
    fontFamily: "Raleway-Bold",
    textAlign: "center",
  },
  routesContent: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 70,
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
    borderColor: "#fa9837",
    borderWidth: 1,
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
  routeLabel: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#333",
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
    backgroundColor: "#fa9837",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    flexDirection: "row", 
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  completedButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8, 
  },
  chevronIcon: {
    marginLeft: 5, 
  },
});

export default D_RoutesScreen;
