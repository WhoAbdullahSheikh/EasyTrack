import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
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
      }
    } else {
      setLocationPermission(true);
    }
  };

  const getUserLocation = () => {
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
        console.log("Location error:", error);
        setRegion({
          latitude: 33.5651, // Default location (e.g., Islamabad)
          longitude: 73.0169,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
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

  const toggleMapOptions = () => {
    setShowMapOptions((prev) => !prev);
    Animated.timing(animation, {
      toValue: showMapOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const changeMapType = (type) => {
    setMapType(type);
    setShowMapOptions(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mapContainer,
          { height: isFullscreen ? "60%" : "40%" },
        ]}
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

        <TouchableOpacity style={styles.toggleButton} onPress={toggleMapOptions}>
          <Icon2 name="globe" size={25} color="#616161" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toggleButton, { top: 100 }]} onPress={toggleFullscreen}>
          <Icon name={isFullscreen ? "compress" : "expand"} size={25} color="#616161" />
        </TouchableOpacity>

        {showMapOptions && (
          <Animated.View style={[styles.optionsMenu, { opacity: animation }]}>
            {["standard", "hybrid", "satellite"].map((type) => (
              <TouchableOpacity key={type} style={styles.customButton} onPress={() => changeMapType(type)}>
                <Text style={styles.buttonText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.routesContainer}>
        <Text style={styles.AvlBusesLabel}>Assigned Stops</Text>
        {assignedRoutes.length > 0 ? (
          assignedRoutes.map((route, index) => (
            <View key={index} style={styles.routeCard}>
              <Text style={styles.CardTitle}>{route.title} - {route.vehicleNumber}</Text>
            </View>
          ))
        ) : (
          <Text>No routes assigned</Text>
        )}
      </ScrollView>
    </View>
  );
};