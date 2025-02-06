import React from "react";
import { View, Image, StyleSheet, SafeAreaView, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import D_HomeScreen from "./src/screens/Driver/navigations/D_HomeScreen";
import D_RoutesScreen from "./src/screens/Driver/navigations/D_RoutesScreen";
import D_AccountScreen from "./src/screens/Driver/navigations/D_AccountScreen";

const Tab = createBottomTabNavigator();

const LogoTitle = () => {
  return (
    <View style={styles.logoContainer}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />
    </View>
  );
};

const DriverMainAppScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fa9837",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopLeftRadius: 30,  
          borderTopRightRadius: 30, 
          borderColor: "#fa9837",
          borderWidth: 1,
          height: 50,               
          elevation: 5,             
          shadowColor: "#000",      
          shadowOffset: { width: 0, height: -3 }, 
          shadowOpacity: 0.1,       
          shadowRadius: 5,          
          paddingBottom: 5,         
          position: "absolute",     
          bottom: 0,                
          left: 0,
          right: 0,
        },
      }}
    >
      {}
      <Tab.Screen
        name="D_Home"
        component={D_HomeScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Icon name="car-sport-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: () => <LogoTitle />,
          headerStyle: {
            backgroundColor: "white",
            borderBottomLeftRadius: 30,  
            borderBottomRightRadius: 30, 
            elevation: 5,                
            shadowColor: "#000",         
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1,          
            shadowRadius: 5, 
          },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      
      {}
      <Tab.Screen
        name="D_Routes"
        component={D_RoutesScreen}
        options={{
          tabBarLabel: "Routes",
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: "Manage Routes",
          headerStyle: {
            backgroundColor: "#fa9837",
            borderBottomLeftRadius: 30,  
            borderBottomRightRadius: 30, 
            elevation: 5,                
            shadowColor: "#000",         
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1,          
            shadowRadius: 5, 
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontFamily: "Raleway-Bold",
            fontSize: 20,
          },
          headerTitleAlign: "center",
        }}
      />
      
      {}
      <Tab.Screen
        name="D_Profile"
        component={D_AccountScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon2 name="account-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: "Driver Profile",
          headerStyle: {
            backgroundColor: "#fa9837",
            borderBottomLeftRadius: 30,  
            borderBottomRightRadius: 30, 
            elevation: 5,                
            shadowColor: "#000",         
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1,          
            shadowRadius: 5, 
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontFamily: "Raleway-Bold",
            fontSize: 20,
          },
          headerTitleAlign: "center",
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
});

export default DriverMainAppScreen;
