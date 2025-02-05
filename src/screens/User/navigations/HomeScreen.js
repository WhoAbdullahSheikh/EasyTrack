import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/FontAwesome";
import firestore from "@react-native-firebase/firestore";

const HomeScreen = () => {
  const [region, setRegion] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [stops, setStops] = useState([]);
  const [mapType, setMapType] = useState("standard");
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

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

  const fetchStopsFromFirestore = () => {
    const unsubscribe = firestore()
      .collection("Routes")
      .doc("details")
      .onSnapshot((routeDoc) => {
        if (routeDoc.exists) {
          const routeData = routeDoc.data();
          const fetchedStops = routeData?.stops || [];
          setStops(fetchedStops);
        } else {
          console.log("No such document!");
        }
      });

    return unsubscribe;
  };

  const checkPermissions = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (!granted) {
        const permissionResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (permissionResult !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission denied");
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const getUserLocation = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User's location:", position);
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
          latitudeDelta: 5.0,
          longitudeDelta: 5.0,
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 100, }
    );
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

  useEffect(() => {
    requestLocationPermission();
    const unsubscribe = fetchStopsFromFirestore();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      getUserLocation();
    }
  }, [locationPermission]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const busIconColor = mapType === "standard" ? "#ff6e26" : "#acff26";

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
        mapType={mapType}
        showsTraffic={true}
      >
        {/* Dynamically render markers for stops with custom icons */}
        {stops.map((stop, index) => (
          <Marker
            key={`${stop.id}-${index}`}
            coordinate={stop.coordinate}
            title={stop.title}
            description={stop.description}
          >
            <Icon name="bus" size={30} color={busIconColor} />
          </Marker>
        ))}
      </MapView>

      {/* Button to toggle map options */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMapOptions}>
        <View style={styles.iconBackground}>
          <Icon2 name="globe" size={25} color="#616161" />
        </View>
      </TouchableOpacity>

      {/* Animated options menu */}
      {showMapOptions && (
        <Animated.View style={[styles.optionsMenu, { opacity: animation }]}>
          {/* Map type buttons in a row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.customButton, styles.standardButton]}
              onPress={() => changeMapType("standard")}
            >
              <Icon name="map" size={25} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.customButton, styles.hybridButton]}
              onPress={() => changeMapType("hybrid")}
            >
              <Icon name="earth" size={25} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.customButton, styles.satelliteButton]}
              onPress={() => changeMapType("satellite")}
            >
              <Icon name="satellite-variant" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    marginTop: -10,
    marginBottom: 35,
  },
  toggleButton: {
    position: "absolute",
    top: 45,
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
    top: 100,
    right: 12,
    borderRadius: 8,
    padding: 1,
  },

  customButton: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  standardButton: {
    backgroundColor: "rgba(76, 175, 80, 1)",
  },
  hybridButton: {
    backgroundColor: "rgba(255, 153, 0, 1)",
  },
  satelliteButton: {
    backgroundColor: "rgba(33, 150, 243, 1)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Raleway-Bold",
  },

  buttonText: {
    color: "#fff", // White text color
    fontSize: 13,
    fontFamily: "Raleway-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default HomeScreen;
