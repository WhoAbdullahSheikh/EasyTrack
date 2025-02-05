import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/FontAwesome";

const RoutesScreen = () => {
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapType, setMapType] = useState("standard");
  const [selectedTime, setSelectedTime] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    fetchStopsFromFirestore();
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
      }
    } else {
      setLocationPermission(true);
    }
  };

  const getUserLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      },
      (error) => {
        setRegion({
          latitude: 33.5651,
          longitude: 73.0169,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 100 }
    );
  };

  const fetchStopsFromFirestore = () => {
    firestore()
      .collection("Routes")
      .doc("details")
      .onSnapshot((routeDoc) => {
        if (routeDoc.exists) {
          const routeData = routeDoc.data();
          const fetchedStops = routeData?.stops || [];
          setStops(fetchedStops);
          setAllRoutes(fetchedStops);
        } else {
          console.log("No such document!");
        }
      });
  };
  const showModal = (message) => {
    setErrorMessage(message);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };
  const handleSearch = async () => {
    if (!selectedTime) {
      showModal("Please select a time slot.");
      return;
    }

    if (
      (startLocation.toLowerCase() !== "islamabad" &&
        startLocation.toLowerCase() !== "rawalpindi") ||
      (destination.toLowerCase() !== "islamabad" &&
        destination.toLowerCase() !== "rawalpindi")
    ) {
      showModal(
        "We operate only in Islamabad and Rawalpindi. Please choose valid locations."
      );
      return;
    }

    if (!startLocation || !destination) {
      showModal("Please provide both start and destination locations");
      return;
    }

    const routesRef = firestore().collection("Routes").doc("details");
    const routeDoc = await routesRef.get();

    if (routeDoc.exists) {
      const routeData = routeDoc.data();
      const fetchedStops = routeData?.stops || [];

      const filtered = fetchedStops.filter((route) => {
        const startMatch =
          route.startLocation &&
          route.startLocation
            .toLowerCase()
            .includes(startLocation.toLowerCase());
        const destinationMatch =
          route.destination &&
          route.destination.toLowerCase().includes(destination.toLowerCase());
        const timeSlotMatch = route.timeSlot === selectedTime;

        return startMatch && destinationMatch && timeSlotMatch;
      });

      setFilteredRoutes(filtered);

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 400, animated: true });
      }
    } else {
      Alert.alert("Error", "No routes found in Firestore");
    }
  };

  const changeMapType = (type) => {
    setMapType(type);
    setShowMapOptions(false);
  };

  const toggleMapOptions = () => {
    setShowMapOptions((prev) => !prev);
    Animated.timing(animation, {
      toValue: showMapOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
    >
      {/* Input Fields for Start and Destination */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWithIcon}>
          <Icon
            name="map-marker"
            size={25}
            color="#1a81f0"
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { fontFamily: "Raleway-Regular" }]}
            value={startLocation}
            onChangeText={setStartLocation}
            placeholder="Enter Start Location"
            placeholderTextColor="#acadad"
          />
        </View>

        <View style={styles.inputWithIcon}>
          <Icon name="flag" size={20} color="#1a81f0" style={styles.icon} />
          <TextInput
            style={[styles.input, { fontFamily: "Raleway-Regular" }]}
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter Destination"
            placeholderTextColor="#acadad"
          />
        </View>
      </View>

      {/* Time Slots */}
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.timeSlotLabel}>Select Time Slot</Text>
        <View style={styles.timeSlots}>
          {["6:30 AM", "9:30 AM", "3:30 PM"].map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlotButton,
                selectedTime === time && styles.timeSlotSelected,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeSlotButtonText,
                  selectedTime === time && styles.timeSlotSelectedText,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {/* Map View */}
      <View style={styles.mapContainer}>
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
            {/* Render Markers for filtered Stops, if any */}
            {(filteredRoutes.length > 0 ? filteredRoutes : allRoutes).map(
              (route, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: route.coordinate.latitude,
                    longitude: route.coordinate.longitude,
                  }}
                  title={route.title}
                  description={route.description}
                />
              )
            )}
          </MapView>
        )}

        {/* Button to toggle map options */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleMapOptions}
        >
          <View style={styles.iconBackground}>
            <Icon2 name="globe" size={25} color="#616161" />
          </View>
        </TouchableOpacity>

        {/* Animated options menu */}
        {showMapOptions && (
          <Animated.View style={[styles.optionsMenu, { opacity: animation }]}>
            {/* Custom buttons with styles */}
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
      </View>

      {/* Filtered Routes Display */}
      <View style={styles.routesContainer}>
        <Text style={styles.AvlBusesLabel}>Available Buses</Text>
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route, index) => (
            <View key={index} style={styles.routeCard}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon
                    name="bus"
                    size={30}
                    color="#1a81f0"
                    style={styles.busIcon}
                  />
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={styles.CardTitle}>
                    {route.busId} {/* Show Bus ID as the title */}
                  </Text>

                  {/* Divider Line Below Card Title */}
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
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text>No routes found for the given locations</Text>
        )}
      </View>

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
                color="#1a81f0"
                style={styles.loading}
              />
            ) : (
              <>
                <Image
                  source={require("../../../../assets/warn.png")}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "92%",
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
    width: 25,
  },
  input: {
    height: 40,
    borderColor: "#1a81f0",
    borderWidth: 1,
    flex: 1,
    paddingLeft: 10,
    borderRadius: 10,
  },
  timeSlotsContainer: {
    marginBottom: 5,
  },
  timeSlotLabel: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Raleway-Bold",
  },
  timeSlots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    margin: 5,
    backgroundColor: "#E1E1E1",
    borderRadius: 10,
  },
  timeSlotSelected: {
    backgroundColor: "#1a81f0",
  },
  timeSlotButtonText: {
    fontSize: 14,
    color: "#000",
  },
  timeSlotSelectedText: {
    color: "#FFF",
  },
  toggleButton: {
    position: "absolute",
    top: 60,
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
    backgroundColor: "#4CAF50", // Green color for Standard
  },

  hybridButton: {
    backgroundColor: "#FF9800", // Orange color for Hybrid
  },

  satelliteButton: {
    backgroundColor: "#2196F3", // Blue color for Satellite
  },

  buttonText: {
    color: "#fff", // White text color
    fontSize: 13,
    fontFamily: "Raleway-Bold",
  },
  searchButton: {
    backgroundColor: "#1a81f0",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  searchButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Raleway-Bold",
  },
  mapContainer: {
    height: 300,
    marginVertical: 10,
  },
  map: {
    flex: 1,
  },
  routesContainer: {
    paddingBottom: 20,
    marginBottom: 40,
    flex: 1,
  },
  AvlBusesLabel: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10,
    fontFamily: "Raleway-Bold",
  },
  CardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  routeCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "#1a81f0",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,

    elevation: 10,
  },
  divider: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#1a81f0",
    marginVertical: 10,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  routeText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
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
    width: 150,
    height: 100,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Raleway-Bold",
    marginBottom: 20,
    textAlign: "center",
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

export default RoutesScreen;
