import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    const checkSessionAndNavigate = async () => {
      try {
        const userSession = await AsyncStorage.getItem("userSession");
        const driverSession = await AsyncStorage.getItem("driverSession");

        if (userSession) {
          navigation.replace("MainApp");
        } else if (driverSession) {
          navigation.replace("DriverMainApp");
        } else {
          navigation.replace("Options");
        }
      } catch (error) {
        console.error("Error checking session", error);
        navigation.replace("Options");
      }
    };

    const timer = setTimeout(() => {
      checkSessionAndNavigate();
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSide}></View>
      <View style={styles.rightSide}></View>

      <Image
        source={require("../../assets/logo2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  leftSide: {
    flex: 1,
    backgroundColor: "#faa652",
  },
  rightSide: {
    flex: 1,
    backgroundColor: "#6db2fc",
  },
  logo: {
    position: "absolute",
    top: "35%",
    left: 10,
    height: 200,
  },
});

export default SplashScreen;